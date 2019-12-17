var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');
  
class ListController {

	constructor(list, options) {
		this.Keys = {
			DOWN: 40,
			UP: 38,
			ENTER: 13,
			TAB: 8,
		};
	
		this.list = list;
		this.listElement = list.list;
		this.listId = 99;
		
		this.list_container = list.listContainer;
		
		this.onSelectedCB = options.onSelectedCB;

		
		// Services.console.logStringMessage('listContainer '+this.list_container.id);
		// Services.console.logStringMessage('list Call '+this.onSelectedCB);

		this.list_container.addEventListener('click', (event) => { this.onClick(event); });
		this.list_container.addEventListener('keydown', (event) => { this.onKey(event); });
		this.list_container.addEventListener('blur', (event) => { this.onBlur(event); });
		this.listElement.setAttribute('selected-index', "-1");
	}

	selectRowByDataId(data_id) {
		if (data_id === -1) {
			this.list_container.classList.remove('no-outline');
			this.listElement.setAttribute('selected-index', "-1");

			let selectedRow = event.target.querySelector('tr.selected-row');
			if (selectedRow) {
				selectedRow.classList.remove('selected-row');
			}
			return;
		}
		
		var selector = 'tr.selected-row';
		var selectedRow = this.list_container.querySelector(selector);
		if (selectedRow) {
			console.debug('selected well '+selectedRow.outerHTML);
			selectedRow.classList.remove('selected-row');
		}


		selector = `tr.list-row[data-id="${data_id}"]`;
		var selectedRow = this.list_container.querySelector(selector);
		if (selectedRow) {
			selectedRow.classList.add('selected-row');
			this.list_container.setAttribute('selected-index', data_id);
			this.list_container.focus();
			console.debug('set focus');
		} else {
			console.debug('no selective');
			this.this_container.focus();
		}
	}

	getSelectedRowDataId() {
		var selector = 'tr.selected-row';
		var selectedRow = this.list_container.querySelector(selector);
		if (selectedRow) {
			return selectedRow.getAttribute('data-id');
		}
		return null;
	}

	getSelectedRowElement() {
		var selector = 'tr.selected-row';
		var selectedRow = this.list_container.querySelector(selector);
		if (selectedRow) {
			return selectedRow;
		}
		return null;
	}

	// Event handlers
 	onClick(event) {
		// Services.console.logStringMessage('Click');
		var selector = 'tr'
		var closestRow = event.target.closest(selector)
		if (!closestRow) return
		var data_id = closestRow.getAttribute('data-id')
		console.log("clickRow "+data_id);
		this.listElement.setAttribute('selected-index', data_id);
		selector = 'tr.selected-row';
		var selectedRow = this.listElement.querySelector(selector);
		if (selectedRow) {
			selectedRow.classList.remove('selected-row');
		}
		closestRow.classList.add('selected-row');

		if (this.onSelectedCB) {
			this.onSelectedCB(event, data_id);
		}
	}

	onKey(event) {
		// Services.console.logStringMessage('Key: '+event.which);
		// Services.console.logStringMessage('ID ' + event.target.getAttribute('selected-index'));
		// Services.console.logStringMessage(this.listElement.outerHTML);

		if (event.target === this.list_container && event.which === this.Keys.DOWN && this.listElement.getAttribute('selected-index') === '-1') {

			// Services.console.logStringMessage('on container Down');

			let next = event.target.querySelector('.list-row');
			next.classList.add('selected-row');
			this.listElement.setAttribute('selected-index', "1");
			this.list_container.classList.add('no-outline');
			// Services.console.logStringMessage(this.list_container.outerHTML);
			if (this.onSelectedCB) {
				this.onSelectedCB(event, "1");
			}
	
			return;
		}

		let selector = 'tr.selected-row';
		let data_id = "-1";
		let selectedRow = event.target.querySelector(selector);

		switch (event.which) {

			case this.Keys.DOWN:
				if (!selectedRow) {
					Services.console.logStringMessage('NoSelectedRow');
					break;
				}
				let nextRow = this.getNextSibling(selectedRow, 'tr.list-row');
				if (!nextRow) {
					Services.console.logStringMessage('NoNextRow');
					break;
				}
				selectedRow.classList.remove('selected-row');
				nextRow.classList.add('selected-row');
				data_id = nextRow.getAttribute('data-id')
				this.listElement.setAttribute('selected-index', data_id);
				if (this.onSelectedCB) {
					Services.console.logStringMessage("onSelectListRow callBack");
					this.onSelectedCB(event, data_id);
				}
		
				break;
			case this.Keys.UP:
				let previousRow = this.getPreviousSibling(selectedRow, 'tr.list-row');
				if (!previousRow) {
					break;
				}
				selectedRow.classList.remove('selected-row');
				previousRow.classList.add('selected-row');
				data_id = previousRow.getAttribute('data-id')
				this.listElement.setAttribute('selected-index', data_id);
				if (this.onSelectedCB) {
					this.onSelectedCB(event, data_id);
				}

				break;
			case this.Keys.ENTER:
				Services.console.logStringMessage('Select');
				break;

			default:
				break;
		}

	}

	onFocus(event) {

	}

	onBlur(event) {
		let relatedTarget = event.relatedTarget;
		Services.console.logStringMessage(relatedTarget.id);

		if (relatedTarget.id === "newButtonNBD" || relatedTarget.id === "editButtonNBD" || relatedTarget.id === "deleteButtonNBD") {
			return;
		}

		this.list_container.classList.remove('no-outline');
		this.listElement.setAttribute('selected-index', "-1");

		let selectedRow = event.target.querySelector('tr.selected-row');
		if (selectedRow) {
			selectedRow.classList.remove('selected-row');
		}
	}


	getPreviousSibling(elem, selector) {
		// Get the next sibling element
		var sibling = elem.previousElementSibling;

		// If there's no selector, return the first sibling
		if (!selector) return sibling;

		// If the sibling matches our selector, use it
		// If not, jump to the next sibling and continue the loop
		while (sibling) {
			if (sibling.matches(selector)) return sibling;
			sibling = sibling.previousElementSibling;
		}

	}

	getNextSibling(elem, selector) {
		// Get the next sibling element
		var sibling = elem.nextElementSibling;

		// If there's no selector, return the first sibling
		if (!selector) return sibling;

		// If the sibling matches our selector, use it
		// If not, jump to the next sibling and continue the loop
		while (sibling) {
			Services.console.logStringMessage(sibling.outerHTML);
			if (sibling.matches(selector)) return sibling;
			sibling = sibling.nextElementSibling
		}
	}
}