(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("js-ready");

  const state = {
    scenario: "self",
    registrationType: "temporary",
  };

  const scenarioLabels = {
    self: "Для себя / аренда",
    family: "Для семьи",
    work: "Для работы",
  };

  const registrationLabels = {
    temporary: "Временная регистрация",
    permanent: "Постоянная регистрация",
  };

  const scenarioTabs = [...document.querySelectorAll('[role="tab"][data-scenario]')];
  const scenarioPanels = [...document.querySelectorAll("[data-scenario-panel]")];
  const scenarioInput = document.querySelector("#scenarioInput");
  const registrationTypeInput = document.querySelector("#registrationTypeInput");
  const leadForm = document.querySelector("#leadForm");
  const formStatus = document.querySelector("#formStatus");
  const submitButton = document.querySelector("#submitButton");

  function setScenario(scenario, { focus = false } = {}) {
    if (!scenarioLabels[scenario]) return;

    state.scenario = scenario;

    scenarioTabs.forEach((tab) => {
      const isSelected = tab.dataset.scenario === scenario;
      tab.classList.toggle("is-active", isSelected);
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
      if (isSelected && focus) tab.focus();
    });

    scenarioPanels.forEach((panel) => {
      const isActive = panel.dataset.scenarioPanel === scenario;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
    });

    if (scenarioInput) scenarioInput.value = scenarioLabels[scenario];
  }

  scenarioTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setScenario(tab.dataset.scenario));

    tab.addEventListener("keydown", (event) => {
      const lastIndex = scenarioTabs.length - 1;
      let nextIndex = index;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = index === lastIndex ? 0 : index + 1;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = index === 0 ? lastIndex : index - 1;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = lastIndex;
      } else {
        return;
      }

      event.preventDefault();
      setScenario(scenarioTabs[nextIndex].dataset.scenario, { focus: true });
    });
  });

  function setRegistrationType(type) {
    if (!registrationLabels[type]) return;

    state.registrationType = type;
    if (registrationTypeInput) registrationTypeInput.value = registrationLabels[type];

    document.querySelectorAll("[data-reg-type]").forEach((control) => {
      const isSelected = control.dataset.regType === type;
      control.closest(".type-card")?.classList.toggle("is-selected", isSelected);
      control.setAttribute("aria-pressed", String(isSelected));
    });
  }

  document.querySelectorAll("[data-reg-type]").forEach((control) => {
    control.addEventListener("click", () => {
      setRegistrationType(control.dataset.regType);
      document.querySelector("#lead-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => document.querySelector("#contact")?.focus(), 500);
    });
  });

  function setForeignIntent() {
    if (scenarioInput) scenarioInput.value = "Иностранный гражданин / отдельный маршрут";
  }

  document.querySelectorAll("[data-form-intent]").forEach((link) => {
    link.addEventListener("click", () => {
      const intent = link.dataset.formIntent;
      if (scenarioLabels[intent]) {
        setScenario(intent);
      } else if (intent === "foreign") {
        setForeignIntent();
      }
    });
  });

  const workflowSteps = [...document.querySelectorAll("[data-workflow-step]")];
  const workflowStages = [...document.querySelectorAll("[data-workflow-stage]")];
  const workflowProgress = [...document.querySelectorAll(".workflow-progress span")];
  const workflowLabel = document.querySelector("[data-workflow-label]");
  const workflowStatus = document.querySelector("[data-workflow-status]");
  const workflowData = {
    1: { label: "Собираем задачу", status: "в работе" },
    2: { label: "Проверяем документы", status: "нужны данные" },
    3: { label: "Подбираем маршрут", status: "сверяем" },
    4: { label: "Сопровождаем оформление", status: "на связи" },
  };

  function setWorkflowStep(step) {
    const numericStep = Number(step);
    const current = workflowData[numericStep] ? numericStep : 1;

    workflowSteps.forEach((control) => {
      const isActive = Number(control.dataset.workflowStep) === current;
      control.classList.toggle("is-active", isActive);
      if (isActive) control.setAttribute("aria-current", "step");
      else control.removeAttribute("aria-current");
    });

    workflowStages.forEach((stage) => {
      stage.hidden = Number(stage.dataset.workflowStage) !== current;
    });

    workflowProgress.forEach((progress, index) => {
      progress.classList.toggle("is-active", index < current);
    });

    if (workflowLabel) workflowLabel.textContent = workflowData[current].label;
    if (workflowStatus) workflowStatus.textContent = workflowData[current].status;
  }

  workflowSteps.forEach((step) => {
    step.addEventListener("click", () => setWorkflowStep(step.dataset.workflowStep));
  });

  const menuToggle = document.querySelector(".menu-toggle");
  const siteHeader = document.querySelector(".site-header");
  const primaryNavigation = document.querySelector("#primary-navigation");

  function closeMenu() {
    if (!menuToggle || !siteHeader) return;
    siteHeader.classList.remove("nav-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Открыть меню");
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = siteHeader?.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
    menuToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
    if (isOpen) primaryNavigation?.querySelector("a")?.focus();
  });

  primaryNavigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  document.querySelector(".hero-route[data-reveal]")?.classList.add("is-visible");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  function setFormStatus(message, type = "success") {
    if (!formStatus) return;
    formStatus.hidden = false;
    formStatus.textContent = message;
    formStatus.classList.toggle("is-error", type === "error");
  }

  function markInvalid(field, invalid) {
    if (!field) return;
    field.setAttribute("aria-invalid", String(invalid));
  }

  function validateForm() {
    if (!leadForm) return false;

    const contact = leadForm.querySelector("#contact");
    const consent = leadForm.querySelector("#consent");
    const hasContact = Boolean(contact?.value.trim());
    const hasConsent = Boolean(consent?.checked);

    markInvalid(contact, !hasContact);
    if (contact && !hasContact) contact.focus();

    if (!hasConsent && contact && hasContact) consent?.focus();
    if (consent) consent.setAttribute("aria-invalid", String(!hasConsent));

    if (!hasContact || !hasConsent) {
      setFormStatus("Укажите контакт и подтвердите согласие — тогда мы сможем ответить.", "error");
      return false;
    }

    return true;
  }

  function clean(value, limit = 1000) {
    return String(value || "").trim().slice(0, limit);
  }

  function buildMessage() {
    const formData = new FormData(leadForm);
    const name = clean(formData.get("name"), 160) || "не указано";
    const contact = clean(formData.get("contact"), 240);
    const request = clean(formData.get("request"), 1200) || "не указано";
    const scenario = clean(formData.get("scenario"), 120);
    const registrationType = clean(formData.get("registration_type"), 120);

    return [
      "Новая заявка — МосРегГид",
      `Сценарий: ${scenario}`,
      `Тип регистрации: ${registrationType}`,
      `Имя: ${name}`,
      `Контакт: ${contact}`,
      `Задача: ${request}`,
    ].join("\n");
  }

  leadForm?.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => {
      if (field.matches("#contact") && field.value.trim()) markInvalid(field, false);
      if (field.matches("#consent") && field.checked) markInvalid(field, false);
      if (formStatus && !formStatus.hidden) formStatus.hidden = true;
    });
  });

  leadForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const honeypot = leadForm.querySelector("#website")?.value.trim();
    if (honeypot) return;
    if (!validateForm() || !submitButton) return;

    submitButton.disabled = true;
    submitButton.textContent = "Отправляем…";
    leadForm.setAttribute("aria-busy", "true");
    if (formStatus) formStatus.hidden = true;

    try {
      const response = await fetch("/api/send-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: buildMessage(), website: "" }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Не удалось отправить обращение");

      setFormStatus("Сообщение отправлено. Вернёмся с ответом после проверки обращения.");
      leadForm.reset();
      setScenario(state.scenario);
      setRegistrationType(state.registrationType);
      formStatus?.focus();
    } catch (error) {
      setFormStatus("Не удалось отправить форму. Напишите напрямую в Telegram или WhatsApp — ссылки есть рядом.", "error");
      console.error("Lead form submission failed", error instanceof Error ? error.message : error);
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Отправить обращение <span>↗</span>';
      leadForm.removeAttribute("aria-busy");
    }
  });

  const currentYear = document.querySelector("#currentYear");
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  if (formStatus) formStatus.tabIndex = -1;
  setScenario(state.scenario);
  setRegistrationType(state.registrationType);
  setWorkflowStep(1);
})();
