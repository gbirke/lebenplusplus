---
title: Using Ansible to call REST APIs
date: "2018-10-02"
tags:
  - ansible
  - REST
  - graylog
categories:
  - wikimedia
description: How to use Ansible to create infrastructure as code for Graylog configuration
---
In the Fundraising Team of Wikimedia Germany we maintain our own infrastructure, using the principle of [Infrastructure as Code](https://en.wikipedia.org/wiki/Infrastructure_as_Code): We write every configuration change, every installed package, every other server setup tweak as a text file that we check into our version control system and do a peer-review on. This way, we can replicate our setups, share knowledge and track changes and their context. While setting up a [Graylog](https://www.graylog.org) instance we discovered that its configuration file does not contain all the information. The log inputs, the alerts, the streams, the dashboards, the searches - we need to configure all those through the web UI. How do we convert calls to a REST API into configuration files? This article explains how to use Ansible to do that.

One of the requirements of our configuration code is that it must be idempotent - re-running the configuration script should not change the configuration if it's already in the desired state. In the context of Graylog this means querying the endpoint, comparing the result and making changes. Let's have a look at three tasks that create a so called "input" on Graylog:

```YAML
- name: List inputs
  uri:
    user: "{{ graylog_login_token }}"
    password: token
    url: "{{ graylog_api_url }}/system/inputs"
    return_content: yes
  register: graylog_inputs

```

When using the `return_content` parameter with the `uri` task, you can store the returned JSON in a variable. If the returned content type is `application/json`, the variable will have a `json` key that contains the JSON data structure. We created the API token in a previous `uri` call, not shown here.

```YAML
- name: Check if we already have a UDP input
  set_fact:
    graylog_has_gelf_udp: >-
      {{
        graylog_inputs.json
        | json_query(
            'inputs[?
               type == `org.graylog2.inputs.gelf.udp.GELFUDPInput`
               &&
               attributes.port == `12201`
            ]'
          )
        | list
        | length > 0
      }}
```

This task sets the boolean variable `graylog_has_gelf_udp`. At first, this might look daunting, so let's go through all the concepts:

We set the value for `graylog_has_gelf_udp` in a YAML "[multiline block with chomping indicator](https://stackoverflow.com/a/21699210/130121)", indicated by the characters `>-`. The `>` means that the YAML parser will remove all newlines, the `-` means that the YAML parser will also compact all the whitespace at the start of each line. The benefit of using this style is that we can structure our query expression with newlines and whitespace, while Ansible still gets one line of text.

The `json_query` function expects a [JMESPath](http://jmespath.org) expression. JMESPath is a query language for JSON. We query the `graylog_inputs.json` variable, stored in the previous task. The JSON contains an array called `inputs`. We query each object in the input array for its `type` - a Java classname - and the `port`. The query result will be the modified `inputs`, containing only objects that matched our query. If no objects matched, the array will be empty.

The query result from `json_query` is a [Python generator](https://wiki.python.org/moin/Generators). We can't use this directly, since our criteria for "Should we create a new input" is the fact that the list of existing inputs is empty. We need to convert the generator to a list, using the `list` function.

```YAML
- name: Create input
  uri:
    method: POST
    user: "{{ graylog_login_token }}"
    password: token
    url: "{{ graylog_api_url }}/system/inputs"
    body: "{{ lookup( 'file', 'files/udp_input.json' ) }}"
    body_format: json
    return_content: yes
    status_code: 201
  when: not graylog_has_gelf_udp

```

The final task uses `uri` again to communicate with the REST endpoint. In true REST fashion, the URL endpoint is the same as the one we used for listing the inputs, but the HTTP method is `POST`. Also, the server returns the HTTP status code `201 - Created`, which we check to make sure that our input worked. We read the data on how we want the input configuration to look like from a file.

This setup works well for us at the moment. But it has the drawback of being verbose - For each configuration, we need three Ansible tasks and a query that looks complicated. In the future, we might create a custom script that communicates with the REST API and does the comparison.
