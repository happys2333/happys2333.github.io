'use strict';
/* Keep the installed Icarus theme intact; decorate its generated pages. */
hexo.extend.injector.register('head_begin', '<script>try{const t=localStorage.getItem("happys-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;}catch(e){}</script>');
hexo.extend.injector.register('head_end', '<meta name="color-scheme" content="light dark"><link rel="stylesheet" href="/assets/site.css">');
hexo.extend.injector.register('body_end', '<button class="theme-toggle" type="button" aria-label="切换深色主题" aria-pressed="false" hidden><span aria-hidden="true">◐</span><span class="theme-label">深色</span></button><script defer src="/assets/site.js"></script>');
