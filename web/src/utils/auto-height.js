export default {
  componentUpdated(el, binding, vnode) {
    const ctx = vnode.context;
    if (!ctx || typeof ctx[binding.arg] === 'undefined' || ctx.autoHeightResizeListener) return;

    ctx.autoHeightResizeListener = () => {
      let top = el.offsetTop;
      let cur = el.offsetParent;
      while (cur !== null) {
        top += cur.offsetTop;
        cur = cur.offsetParent;
      }
      const h = (window.innerHeight - top) + binding.value;
      ctx[binding.arg] = Math.max(h, 100);
    };

    window.addEventListener('resize', ctx.autoHeightResizeListener, false);
    setTimeout(ctx.autoHeightResizeListener, 50);
  },
  unbind(el, binding, vnode) {
    const ctx = vnode.context;
    if (ctx && ctx.autoHeightResizeListener) {
      window.removeEventListener('resize', ctx.autoHeightResizeListener, false);
      ctx.autoHeightResizeListener = null;
    }
  },
};
