# Personal blog of Gabriel Birke

## Local Development

Download Spress and make it executable: 
    curl -LOS https://github.com/spress/Spress/releases/download/v2.1.3/spress.phar
    chmod a+x spress.phar

Optionally: Rename the executable to `spress` and move into into your `$PATH`.

Run

    $ cd /your-site-dir
    $ spress site:build --server --watch
    
    # Browse to localhost:4000

Design by [Michael Rose](https://mademistakes.com/)  
Powered by [Spress](http://spress.yosymfony.com), using the [Tinto](https://github.com/enzolutions/spress-tinto-theme/) theme.
