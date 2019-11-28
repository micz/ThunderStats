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
		this.listId = 99;
		
		this.list_container = list.listContainer;
		
		this.onSelectedCB = options.onSelectedCB;

		
		Services.console.logStringMessage('listContainer '+this.list_container.id);
		Services.console.logStringMessage('list Call '+this.onSelectedCB);
		this.list_container.addEventListener('click', (event) => { this.onClick(event); });
		this.list_container.addEventListener('keydown', (event) => { this.onKey(event); });
		this.list_container.addEventListener('blur', (event) => { this.onBlur(event); });
		this.list_container.setAttribute('selected-index', "-1");
	}

	selectRowByDataId(data_id) {
		var selector = 'tr.selected-row';
		var selectedRow = this.list_container.querySelector(selector);
		if (selectedRow) {
			selectedRow.classList.remove('selected-row');
		}
		selector = `tr.list-row[data-id="${data_id}"]`;
		var selectedRow = this.list_container.querySelector(selector);
		if (selectedRow) {
			selectedRow.classList.add('selected-row');
			this.list_container.setAttribute('selected-index', data_id);
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
		console.debug('Click');
		var selector = 'tr'
		var closestRow = event.target.closest(selector)
		if (!closestRow) return
		var data_id = closestRow.getAttribute('data-id')
		console.log(data_id);
		this.list_container.setAttribute('selected-index', data_id);
		selector = 'tr.selected-row';
		var selectedRow = this.list_container.querySelector(selector);
		if (selectedRow) {
			selectedRow.classList.remove('selected-row');
		}
		closestRow.classList.add('selected-row');

		console.debug('Click call' + closestRow.outerHTML);
		if (this.onSelectedCB) {
			this.onSelectedCB(event, data_id);
		}
		Services.console.logStringMessage('after call');

	}

	onKey(event) {
		console.debug('Key');
		console.debug(event.target.outerHTML);
		console.debug('ID ' + event.target.id);
		if (event.target === this.list_container && event.target.getAttribute('selected-index') === "-1") {
			console.debug('on container');

			let next = event.target.querySelector('.list-row');
			next.classList.add('selected-row');
			this.list_container.setAttribute('selected-index', "1");
			this.list_container.classList.add('no-outline');
			console.debug(event.target.outerHTML);
			return;
		}

		let selector = 'tr.selected-row';
		let data_id = "-1";
		let selectedRow = event.target.querySelector(selector);

		switch (event.which) {

			case this.Keys.DOWN:
				let nextRow = this.getNextSibling(selectedRow, 'tr.list-row');
				if (!nextRow) {
					break;
				}
				selectedRow.classList.remove('selected-row');
				nextRow.classList.add('selected-row');
				data_id = nextRow.getAttribute('data-id')
				this.list_container.setAttribute('selected-index', data_id);
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
				this.list_container.setAttribute('selected-index', data_id);
				if (this.onSelectedCB) {
					this.onSelectedCB(event, data_id);
				}

				break;
			case this.Keys.ENTER:
				console.debug('Select');
				break;

			default:
				break;
		}

	}

	onFocus(event) {

	}

	onBlur(event) {
		this.list_container.setAttribute('selected-index', "-1");
		this.list_container.classList.remove('no-outline');
		let selectedRow = event.target.querySelector('tr.selected-row');
		if (selectedRow) {
			// selectedRow.classList.remove('selected-row');
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
			console.debug(sibling.outerHTML);
			if (sibling.matches(selector)) return sibling;
			sibling = sibling.nextElementSibling
		}
	}
}