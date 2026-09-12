/* =========================================================
   拾味山房 · 首页交互（对接后端版）
   ========================================================= */

(function () {
  "use strict";

  var $ = function (selector, context) {
    return (context || document).querySelector(selector);
  };
  var $$ = function (selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  };

  /* ---------- 吸顶导航 ---------- */
  var header = $("#siteHeader");
  var nav = $("#siteNav");
  var navToggle = $("#navToggle");

  function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 24);
  }

  function closeMenu() {
    nav.classList.remove("open");
    navToggle.classList.remove("active");
    header.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  navToggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("open");
    navToggle.classList.toggle("active", isOpen);
    header.classList.toggle("menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  $$("a", nav).forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", function (event) {
    if (!header.contains(event.target) && nav.classList.contains("open")) {
      closeMenu();
    }
  });

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* ---------- 页脚年份 ---------- */
  var yearNode = $("#year");
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  /* ---------- 滚动显现动画 ---------- */
  var revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- 食客点评轮播 ---------- */
  var viewport = $("#sliderViewport");
  var track = $("#sliderTrack");
  var dotsWrap = $("#sliderDots");
  var prevBtn = $("#prevSlide");
  var nextBtn = $("#nextSlide");
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (track && viewport) {
    var slides = $$(".review-card", track);
    var current = 0;
    var timer = null;

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = "translateX(-" + current * 100 + "%)";
      $$(".slider-dots button").forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function startAuto() {
      if (prefersReducedMotion || slides.length < 2) return;
      timer = window.setInterval(function () {
        goTo(current + 1);
      }, 5600);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "查看第 " + (i + 1) + " 条点评");
      dot.addEventListener("click", function () {
        stopAuto();
        goTo(i);
        startAuto();
      });
      dotsWrap.appendChild(dot);
    });

    prevBtn.addEventListener("click", function () {
      stopAuto();
      goTo(current - 1);
      startAuto();
    });

    nextBtn.addEventListener("click", function () {
      stopAuto();
      goTo(current + 1);
      startAuto();
    });

    viewport.addEventListener("mouseenter", stopAuto);
    viewport.addEventListener("mouseleave", startAuto);
    viewport.addEventListener("focusin", stopAuto);
    viewport.addEventListener("focusout", startAuto);

    var startX = null;
    viewport.addEventListener("pointerdown", function (event) { startX = event.clientX; }, { passive: true });
    viewport.addEventListener("pointerup", function (event) {
      if (startX === null) return;
      var delta = event.clientX - startX;
      if (Math.abs(delta) > 45) {
        stopAuto();
        goTo(current + (delta < 0 ? 1 : -1));
        startAuto();
      }
      startX = null;
    }, { passive: true });

    goTo(0);
    startAuto();
  }

  /* ---------- 在线预订表单（已对接后端） ---------- */
  var form = $("#reserveForm");
  if (form) {
    var dateInput = $("#date");
    var successBox = $("#formSuccess");
    var submitBtn = $(".btn-block", form);

    var today = new Date();
    var localDate =
      today.getFullYear() + "-" +
      String(today.getMonth() + 1).padStart(2, "0") + "-" +
      String(today.getDate()).padStart(2, "0");
    dateInput.min = localDate;

    function setInvalid(input, invalid) {
      input.classList.toggle("invalid", invalid);
      return !invalid;
    }

    function isValidName(value) { return value.trim().length >= 2; }
    function isValidPhone(value) {
      var digits = value.replace(/[\s-]/g, "");
      return /^1[3-9]\d{9}$/.test(digits) || /^0\d{2,3}-?\d{7,8}$/.test(value.trim());
    }

    function validate() {
      var nameOk = setInvalid($("#name"), !isValidName($("#name").value));
      var phoneOk = setInvalid($("#phone"), !isValidPhone($("#phone").value));
      var dateOk = setInvalid(dateInput, !dateInput.value || dateInput.value < dateInput.min);
      var timeOk = setInvalid($("#time"), !$("#time").value);
      var guestsOk = setInvalid($("#guests"), !$("#guests").value);
      return nameOk && phoneOk && dateOk && timeOk && guestsOk;
    }

    $$("input, select, textarea", form).forEach(function (field) {
      field.addEventListener("input", function () { field.classList.remove("invalid"); });
      field.addEventListener("change", function () { field.classList.remove("invalid"); });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      successBox.hidden = true;
      successBox.classList.remove("error");

      if (!validate()) {
        successBox.classList.add("error");
        successBox.textContent = "请检查上方标红的信息，确认后重新提交。";
        successBox.hidden = false;
        var firstInvalid = $(".invalid", form);
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // 收集表单数据
      var formData = {
        name: $("#name").value,
        phone: $("#phone").value,
        date: $("#date").value,
        timeSlot: $("#time").value,
        people: $("#guests").value,
        occasion: $("#occasion").value,
        remark: $("#note").value
      };

      // 禁用按钮，防止重复提交
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.65";
      submitBtn.textContent = "正在提交...";

      // 发送请求到 Python 后端
      fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      .then(function(res) { return res.json(); })
      .then(function(result) {
        if (result.code === 200) {
          successBox.textContent = "预订信息已收到！我们会在 30 分钟内电话与您确认。";
          successBox.hidden = false;
          form.reset();
          submitBtn.textContent = "提交成功，等待确认";
          window.setTimeout(function () {
            submitBtn.disabled = false;
            submitBtn.style.opacity = "";
            submitBtn.textContent = "提交预订信息";
          }, 4200);
        } else {
          throw new Error(result.message || "预订失败");
        }
      })
      .catch(function(error) {
        successBox.classList.add("error");
        successBox.textContent = "提交失败：" + error.message + "，请稍后重试。";
        successBox.hidden = false;
        submitBtn.disabled = false;
        submitBtn.style.opacity = "";
        submitBtn.textContent = "提交预订信息";
      });
    });
  }
})();