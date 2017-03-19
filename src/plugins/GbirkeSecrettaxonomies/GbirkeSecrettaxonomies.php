<?php


use Yosymfony\Spress\Core\Plugin\PluginInterface;
use Yosymfony\Spress\Core\Plugin\EventSubscriber;
use Yosymfony\Spress\Core\Plugin\Event\EnvironmentEvent;
use Yosymfony\Spress\Core\Plugin\Event\RenderEvent;

class GbirkeSecrettaxonomies implements PluginInterface
{
    private $io;

    private $hiddenTags = [];
    private $removeTags = true;
    private $removeTermURLs = true;

    public function initialize(EventSubscriber $subscriber)
    {
        $subscriber->addEventListener('spress.start', 'onStart');
        $subscriber->addEventListener('spress.before_render_blocks', 'onBeforeRenderBlocks');
    }

    public function getMetas()
    {
        return [
            'name' => 'gbirke/secret_taxonomies',
            'description' => 'Hide configured tags',
            'author' => 'Gabriel Birke',
            'license' => 'MIT',
        ];
    }

    public function onStart(EnvironmentEvent $event)
    {
        $this->io = $event->getIO();

        $configValues = $event->getConfigValues();
        if ( !isset($configValues['secret_taxonomies']) ) {
            return;
        }
        $config = $configValues['secret_taxonomies'];

        if ( isset($config['tags']) && is_array($config['tags']) ) {
                $this->hiddenTags = $config['tags'];
        }
        $this->removeTags = isset($config['remove_tags']) ? $config['remove_tags'] : true;
        $this->removeTermURLs = isset($config['remove_term_urls']) ? $config['remove_term_urls'] : true;
    }

    public function onBeforeRenderBlocks(RenderEvent $event)
    {
        $attributes = $event->getAttributes();
        $attributes = $this->removeTagsFromAttributes($attributes);
        $attributes = $this->removeTermURLsFromAttributes($attributes);

        $event->setAttributes($attributes);
    }

    private function removeTagsFromAttributes($attributes) {
        if ( isset($attributes['tags']) && $this->hiddenTags && $this->removeTags ) {
            $attributes['tags'] = array_diff(
                $attributes['tags'],
                $this->hiddenTags
            );
            if ( !$attributes['tags'] ) {
                unset($attributes['tags']);
            }
        }
        return $attributes;
    }

    private function removeTermURLsFromAttributes($attributes) {
        if ( !$this->removeTermURLs ) {
            return $attributes;
        }
        foreach( $this->hiddenTags as $tag ) {
            unset($attributes['terms_url']['tags'][$tag]);
        }
        return $attributes;
    }

}
