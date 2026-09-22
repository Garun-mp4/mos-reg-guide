(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("js-ready");

  const state = {
    scenario: "self",
    registrationType: "temporary",
    formScenario: "Для себя / аренда",
    responseChannel: "telegram",
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
  const contactInput = document.querySelector("#contact");
  const contactError = document.querySelector("#contactError");
  const consentInput = document.querySelector("#consent");
  const consentError = document.querySelector("#consentError");
  const contactHint = document.querySelector("#contactHint");
  const channelHint = document.querySelector("#channelHint");
  const responseChannelInputs = [...document.querySelectorAll('input[name="response_channel"]')];
  const responseChannelData = {
    telegram: {
      label: "Telegram",
      placeholder: "@username в Telegram…",
      inputMode: "text",
      type: "text",
      autocomplete: "off",
      hint: "Укажите @username или номер, привязанный к Telegram.",
    },
    whatsapp: {
      label: "WhatsApp",
      placeholder: "+7 999 123-45-67…",
      inputMode: "tel",
      type: "tel",
      autocomplete: "tel",
      hint: "Укажите номер, на который можно написать в WhatsApp.",
    },
    phone: {
      label: "Телефон",
      placeholder: "+7 999 123-45-67…",
      inputMode: "tel",
      type: "tel",
      autocomplete: "tel",
      hint: "Укажите номер, по которому можно позвонить.",
    },
  };

  function setScenario(scenario, { focus = false, updateFormScenario = true } = {}) {
    if (!scenarioLabels[scenario]) return;

    state.scenario = scenario;
    if (updateFormScenario) state.formScenario = scenarioLabels[scenario];

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

    if (scenarioInput && updateFormScenario) scenarioInput.value = state.formScenario;
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
      const label = control.querySelector(".card-link__label");
      if (label) label.textContent = isSelected ? "Обсудить этот вариант" : "Выбрать для разговора";
    });
  }

  function setResponseChannel(channel) {
    const selected = responseChannelData[channel] ? channel : "telegram";
    const details = responseChannelData[selected];
    state.responseChannel = selected;

    responseChannelInputs.forEach((input) => {
      input.checked = input.value === selected;
    });

    if (contactInput) {
      contactInput.placeholder = details.placeholder;
      contactInput.inputMode = details.inputMode;
      contactInput.type = details.type;
      contactInput.autocomplete = details.autocomplete;
    }
    if (contactHint) contactHint.textContent = details.hint;
    if (channelHint) channelHint.textContent = `Канал ответа: ${details.label}.`;
  }

  responseChannelInputs.forEach((input) => {
    input.addEventListener("change", () => setResponseChannel(input.value));
  });

  document.querySelectorAll("[data-reg-type]").forEach((control) => {
    control.addEventListener("click", () => {
      setRegistrationType(control.dataset.regType);
      document.querySelector("#lead-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.requestAnimationFrame(() => contactInput?.focus({ preventScroll: true }));
    });
  });

  function setForeignIntent() {
    state.formScenario = "Иностранный гражданин / отдельный маршрут";
    if (scenarioInput) scenarioInput.value = state.formScenario;
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

  function closeMenu({ restoreFocus = false } = {}) {
    if (!menuToggle || !siteHeader) return;
    const wasOpen = siteHeader.classList.contains("nav-open");
    siteHeader.classList.remove("nav-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Открыть меню");
    if (restoreFocus && wasOpen) {
      window.setTimeout(() => menuToggle.focus(), 0);
    }
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = siteHeader?.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
    menuToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
    if (isOpen) primaryNavigation?.querySelector("a")?.focus();
  });

  primaryNavigation?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      const target = link.hash ? document.querySelector(link.hash) : null;
      closeMenu({ restoreFocus: !target });
      if (target) window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu({ restoreFocus: true });
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

    const hasContact = Boolean(contactInput?.value.trim());
    const hasConsent = Boolean(consentInput?.checked);
    const hasResponseChannel = Boolean(responseChannelData[state.responseChannel]);

    markInvalid(contactInput, !hasContact);
    markInvalid(consentInput, !hasConsent);
    if (contactError) contactError.hidden = hasContact;
    if (consentError) consentError.hidden = hasConsent;

    if (!hasContact) contactInput?.focus();
    else if (!hasConsent) consentInput?.focus();

    if (!hasContact || !hasConsent || !hasResponseChannel) {
      setFormStatus("Проверьте контакт и согласие, чтобы отправить обращение.", "error");
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
    const responseChannel = responseChannelData[state.responseChannel]?.label || "не указан";

    return [
      "Новая заявка — МосРегГид",
      `Сценарий: ${scenario}`,
      `Тип регистрации: ${registrationType}`,
      `Канал ответа: ${responseChannel}`,
      `Имя: ${name}`,
      `Контакт: ${contact}`,
      `Задача: ${request}`,
    ].join("\n");
  }

  leadForm?.addEventListener("input", (event) => {
    if (event.target === contactInput && contactInput.value.trim()) {
      markInvalid(contactInput, false);
      if (contactError) contactError.hidden = true;
    }
    if (formStatus && !formStatus.hidden) formStatus.hidden = true;
  });

  consentInput?.addEventListener("change", () => {
    if (consentInput.checked) {
      markInvalid(consentInput, false);
      if (consentError) consentError.hidden = true;
    }
    if (formStatus && !formStatus.hidden) formStatus.hidden = true;
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
      if (!response.ok) throw new Error(result.error || result.message || "Не удалось отправить обращение");

      setFormStatus("Сообщение отправлено. Вернёмся с ответом после проверки обращения.");
      const submittedScenario = state.formScenario;
      leadForm.reset();
      setScenario(state.scenario, { updateFormScenario: false });
      if (scenarioInput) scenarioInput.value = submittedScenario;
      setRegistrationType(state.registrationType);
      setResponseChannel("telegram");
      formStatus?.focus();
    } catch (error) {
      setFormStatus("Не удалось отправить форму. Напишите напрямую в Telegram или WhatsApp — ссылки есть рядом.", "error");
      console.error("Lead form submission failed", error instanceof Error ? error.message : error);
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Отправить обращение <span aria-hidden="true">↗</span>';
      leadForm.removeAttribute("aria-busy");
    }
  });

  const currentYear = document.querySelector("#currentYear");
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  if (formStatus) formStatus.tabIndex = -1;
  setScenario(state.scenario);
  setRegistrationType(state.registrationType);
  setResponseChannel(state.responseChannel);
  setWorkflowStep(1);
})();
