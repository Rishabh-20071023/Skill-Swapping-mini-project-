/* =============================================================================
   SkillLoom — 404 page controller
   The custom error page served by serve.js for unknown routes.
   ========================================================================== */

(function (SL) {
  "use strict";

  function init() {
    SL.navbar.render();
    SL.footer.render();
    SL.motion.initAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SL);
