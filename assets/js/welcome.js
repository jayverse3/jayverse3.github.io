(() => {
  const welcome = document.querySelector("[data-welcome-messages]");
  if (!welcome || typeof window.Typed !== "function") return;

  const messages = JSON.parse(welcome.dataset.welcomeMessages);
  const text = welcome.querySelector(".home-welcome__text");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animation;
  let cursorBlinkAnimation;

  function updateAnimation() {
    if (cursorBlinkAnimation) {
      cursorBlinkAnimation.cancel();
      cursorBlinkAnimation = null;
    }
    if (animation) {
      animation.destroy();
      animation = null;
    }

    text.textContent = messages[0];
    if (reducedMotion.matches) return;

    text.textContent = "";
    animation = new window.Typed(text, {
      // HTML entities keep emoji intact during typing.
      strings: messages.map(message =>
        Array.from(message, character => `&#${character.codePointAt(0)};`).join("")
      ),
      typeSpeed: 55,
      startDelay: 500,
      loop: false,
      showCursor: true,
      cursorChar: "|",
      contentType: "html",
      onComplete(instance) {
        const cursor = instance.cursor;
        if (!cursor) return;

        // Replace the continuous blink with three full cycles ending unlit.
        cursor.style.animation = "none";
        cursorBlinkAnimation = cursor.animate([
          { opacity: 1, offset: 0, easing: "step-end" },
          { opacity: 0, offset: 0.5 },
          { opacity: 0, offset: 1 }
        ], { duration: 700, iterations: 3, fill: "forwards" });
        cursorBlinkAnimation.onfinish = () => {
          cursor.style.visibility = "hidden";
        };
      }
    });
  }

  updateAnimation();
  reducedMotion.addEventListener("change", updateAnimation);
})();
