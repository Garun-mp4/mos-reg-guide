;(function () {
	document.querySelectorAll('.tabs').forEach(function (tabs) {
		tabs.querySelectorAll('.tab').forEach(function (btn) {
			btn.setAttribute(
				'aria-selected',
				btn.classList.contains('active') ? 'true' : 'false',
			)
			btn.addEventListener('click', function () {
				var panelWrap = tabs.parentElement
				tabs.querySelectorAll('.tab').forEach(function (b) {
					b.classList.remove('active')
					b.setAttribute('aria-selected', 'false')
				})
				btn.classList.add('active')
				btn.setAttribute('aria-selected', 'true')
				panelWrap.querySelectorAll('.tab-panel').forEach(function (p) {
					p.classList.remove('active')
				})
				var target = panelWrap.querySelector(
					'.tab-panel[data-panel="' + btn.getAttribute('data-tab') + '"]',
				)
				if (target) target.classList.add('active')
			})
		})
	})

	var state = { who: 'for myself', priority: 'speed' }
	var title = document.getElementById('quizTitle')
	var text = document.getElementById('quizText')
	var form = document.getElementById('contactForm')
	var nameField = form ? form.querySelector('[name="name"]') : null
	var phoneField = form ? form.querySelector('[name="phone"]') : null
	var quizSelectionNote = document.getElementById('quizSelectionNote')
	var quizToFormBtn = document.getElementById('quizToFormBtn')
	var siteHeader = document.querySelector('.site-header')
	var menuToggle = document.getElementById('menuToggle')
	var checklistModal = document.getElementById('checklistModal')
	var openChecklistModalBtn = document.getElementById('openChecklistModal')
	var closeChecklistModalTop = document.getElementById('closeChecklistModalTop')
	var checklistForm = document.getElementById('checklistForm')
	var contactFormStatus = document.getElementById('contactFormStatus')
	var checklistFormStatus = document.getElementById('checklistFormStatus')
	var lastFocusedElement = null
	var quizLabels = {
		who: {
			'for myself': 'для себя',
			'for family': 'для семьи с детьми',
			'for employee': 'для сотрудника',
		},
		priority: {
			speed: 'скорость',
			price: 'цена',
			support: 'сопровождение',
		},
	}

	function getQuizSummary() {
		return {
			who: quizLabels.who[state.who],
			priority: quizLabels.priority[state.priority],
		}
	}

	function syncQuizWithForm() {
		if (!form) return
		var summary = getQuizSummary()
		var quizWhoField = form.querySelector('[name="quiz_who"]')
		var quizPriorityField = form.querySelector('[name="quiz_priority"]')
		var selectionText =
			'Подбор по квизу: ' +
			summary.who +
			', приоритет — ' +
			summary.priority +
			'.'

		if (quizWhoField) quizWhoField.value = summary.who
		if (quizPriorityField) quizPriorityField.value = summary.priority
		if (quizSelectionNote) quizSelectionNote.textContent = selectionText
	}

	function setFormStatus(statusEl, type, message) {
		if (!statusEl) return
		statusEl.className = 'form-status tiny active ' + type
		statusEl.textContent = message
	}

	function clearFormStatus(statusEl) {
		if (!statusEl) return
		statusEl.className = 'form-status tiny'
		statusEl.textContent = ''
	}

	function setSubmitting(formEl, isSubmitting, label) {
		var submitButton = formEl.querySelector('[type="submit"]')
		if (!submitButton) return
		if (!submitButton.dataset.defaultText) {
			submitButton.dataset.defaultText = submitButton.textContent.trim()
		}
		submitButton.disabled = isSubmitting
		submitButton.textContent = isSubmitting
			? label
			: submitButton.dataset.defaultText
	}

	function sendTelegramMessage(text) {
		return fetch('/api/send-telegram', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ text: text }),
		}).then(function (response) {
			return response
				.json()
				.catch(function () {
					return {}
				})
				.then(function (result) {
					if (!response.ok || result.ok === false) {
						throw new Error(
							result.message ||
								'Telegram не принял сообщение. Проверьте настройки бота.',
						)
					}
					return result
				})
		})
	}

	function updateQuiz() {
		var map = {
			'for myself': {
				speed: [
					'Подойдёт быстрый подбор и консультация',
					'Если вам нужна регистрация для себя, мы уточним сроки, документы и предложим понятный вариант без лишней бюрократии.',
				],
				price: [
					'Подойдёт бюджетный и прозрачный сценарий',
					'Для личного запроса покажем, как получить понятный расчёт и не переплачивать за лишние услуги.',
				],
				support: [
					'Подойдёт сопровождение на каждом шаге',
					'Мы поможем понять процесс, собрать документы и не потеряться в деталях.',
				],
			},
			'for family': {
				speed: [
					'Подойдёт семейный сценарий с быстрым стартом',
					'Если регистрация нужна для детей, школы, сада или поликлиники, важны сроки и точный список документов.',
				],
				price: [
					'Подойдёт оптимальный вариант для семьи',
					'Подберём решение с учётом бюджета и задач всей семьи.',
				],
				support: [
					'Подойдёт сопровождение для родителей',
					'Объясним всё простым языком и поможем пройти процесс без лишних звонков и очередей.',
				],
			},
			'for employee': {
				speed: [
					'Подойдёт срочное оформление для сотрудника',
					'Если вопрос связан с работой, сделаем акцент на быстром контакте и чётком следующем шаге.',
				],
				price: [
					'Подойдёт понятный расчёт для HR/работодателя',
					'Покажем прозрачные условия и поможем быстро закрыть задачу.',
				],
				support: [
					'Подойдёт полное сопровождение по заявке',
					'Возьмём на себя коммуникацию и подскажем, какие данные нужны для старта.',
				],
			},
		}
		var result = map[state.who][state.priority]
		title.textContent = result[0]
		text.textContent = result[1]
		syncQuizWithForm()
	}
	document.querySelectorAll('[data-group]').forEach(function (groupEl) {
		var group = groupEl.getAttribute('data-group')
		groupEl.querySelectorAll('.option').forEach(function (opt) {
			opt.setAttribute(
				'aria-pressed',
				opt.classList.contains('active') ? 'true' : 'false',
			)
			opt.addEventListener('click', function () {
				groupEl.querySelectorAll('.option').forEach(function (o) {
					o.classList.remove('active')
					o.setAttribute('aria-pressed', 'false')
				})
				opt.classList.add('active')
				opt.setAttribute('aria-pressed', 'true')
				state[group] = opt.getAttribute('data-value')
				updateQuiz()
			})
		})
	})
	updateQuiz()

	function openModal(modal, focusTarget) {
		if (!modal) return
		lastFocusedElement = document.activeElement
		modal.classList.add('active')
		modal.setAttribute('aria-hidden', 'false')
		document.body.classList.add('modal-open')
		if (focusTarget) focusTarget.focus()
	}

	function closeModal(modal) {
		if (!modal) return
		modal.classList.remove('active')
		modal.setAttribute('aria-hidden', 'true')
		if (
			!document.querySelector('.modal-backdrop.active') &&
			document.body.classList.contains('modal-open')
		) {
			document.body.classList.remove('modal-open')
		}
		if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
			lastFocusedElement.focus()
		}
	}

	function setMenuState(isOpen) {
		if (!siteHeader || !menuToggle) return
		siteHeader.classList.toggle('nav-open', isOpen)
		menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
		menuToggle.setAttribute(
			'aria-label',
			isOpen ? 'Закрыть меню' : 'Открыть меню',
		)
	}

	if (menuToggle && siteHeader) {
		menuToggle.addEventListener('click', function () {
			setMenuState(!siteHeader.classList.contains('nav-open'))
		})
	}

	document
		.querySelectorAll('.nav-link, .header-actions a, .brand')
		.forEach(function (link) {
			link.addEventListener('click', function () {
				if (window.innerWidth <= 980) {
					setMenuState(false)
				}
			})
		})

	if (openChecklistModalBtn && checklistModal && checklistForm) {
		openChecklistModalBtn.addEventListener('click', function () {
			openModal(checklistModal, checklistForm.querySelector('[name="name"]'))
		})
	}

	if (closeChecklistModalTop && checklistModal) {
		closeChecklistModalTop.addEventListener('click', function () {
			closeModal(checklistModal)
		})
	}

	if (checklistModal) {
		checklistModal.addEventListener('click', function (e) {
			if (e.target === checklistModal) {
				closeModal(checklistModal)
			}
		})
	}

	document.addEventListener('keydown', function (e) {
		if (e.key !== 'Escape') return
		if (checklistModal && checklistModal.classList.contains('active')) {
			closeModal(checklistModal)
		}
	})

	if (quizToFormBtn) {
		quizToFormBtn.addEventListener('click', function () {
			syncQuizWithForm()
			setTimeout(function () {
				if (nameField && !nameField.value.trim()) {
					nameField.focus()
					return
				}
				if (phoneField && !phoneField.value.trim()) {
					phoneField.focus()
				}
			}, 350)
		})
	}

	if (form) form.addEventListener('submit', function (e) {
		e.preventDefault()
		clearFormStatus(contactFormStatus)
		setSubmitting(form, true, 'Отправляем...')
		var data = new FormData(form)
		var name = (data.get('name') || '').toString().trim()
		var phone = (data.get('phone') || '').toString().trim()
		var message = (data.get('message') || '').toString().trim()
		var quizWho = (data.get('quiz_who') || '').toString().trim()
		var quizPriority = (data.get('quiz_priority') || '').toString().trim()
		var textMsg = [
			'Здравствуйте! Нужна консультация по регистрации.',
			name ? 'Имя: ' + name : '',
			phone ? 'Контакт: ' + phone : '',
			quizWho ? 'Для кого нужна регистрация: ' + quizWho : '',
			quizPriority ? 'Что важнее всего: ' + quizPriority : '',
			message ? 'Запрос: ' + message : '',
			'Страница: ' + window.location.href,
		]
			.filter(Boolean)
			.join('\n')
		sendTelegramMessage(textMsg)
			.then(function () {
				setFormStatus(
					contactFormStatus,
					'success',
					'Заявка отправлена. Мы свяжемся с вами по указанному контакту.',
				)
				form.reset()
				syncQuizWithForm()
			})
			.catch(function (error) {
				setFormStatus(
					contactFormStatus,
					'error',
					error.message || 'Не удалось отправить заявку. Попробуйте позже.',
				)
			})
			.finally(function () {
				setSubmitting(form, false)
			})
	})

	if (checklistForm) {
		checklistForm.addEventListener('submit', function (e) {
			e.preventDefault()
			clearFormStatus(checklistFormStatus)
			setSubmitting(checklistForm, true, 'Отправляем...')
			var data = new FormData(checklistForm)
			var checklistName = (data.get('name') || '').toString().trim()
			var checklistContact = (data.get('contact') || '').toString().trim()
			var checklistComment = (data.get('comment') || '').toString().trim()
			var checklistText = [
				'Здравствуйте! Хочу получить чек-лист по регистрации в Москве и МО.',
				checklistName ? 'Имя: ' + checklistName : '',
				checklistContact ? 'Контакт: ' + checklistContact : '',
				checklistComment ? 'Комментарий: ' + checklistComment : '',
				'Страница: ' + window.location.href,
			]
				.filter(Boolean)
				.join('\n')
			sendTelegramMessage(checklistText)
				.then(function () {
					setFormStatus(
						checklistFormStatus,
						'success',
						'Заявка отправлена. Мы пришлём чек-лист по указанному контакту.',
					)
					setTimeout(function () {
						checklistForm.reset()
						clearFormStatus(checklistFormStatus)
						closeModal(checklistModal)
					}, 700)
				})
				.catch(function (error) {
					setFormStatus(
						checklistFormStatus,
						'error',
						error.message || 'Не удалось отправить заявку. Попробуйте позже.',
					)
				})
				.finally(function () {
					setSubmitting(checklistForm, false)
				})
		})
	}
})()
