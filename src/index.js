var dir;

function upOneLevel() {

	const index = dir.indexOf('/');
	const lastIndex = dir.lastIndexOf('/');

	if (index == lastIndex) {
		M.toast({html: 'This is the root folder'});
		return;
	}

	const folder = dir.substr(0, lastIndex);
	renderFolder(folder);
}

function breadcrumbs() {
	const folders = dir.split('/');
	const len = folders.length;
	var level = '';

	const container = document.querySelector('#div-breadcrumbs');
	container.innerHTML = '';

	for (var i = 1; i < len; i++) {

		level = level + '/' + folders[i];

		const elem = document.createElement('a');
		elem.innerHTML = folders[i];
		elem.addEventListener('click', openBreadcrumb);
		elem.setAttribute('data-folder-link', level);
		elem.classList.add('clickable');
		elem.classList.add('breadcrumb');

		container.appendChild(elem);
	}

	container.children[0].innerHTML = 'Root';

}

function openBreadcrumb({target}) {

	var url = target.getAttribute('data-folder-link');
	if (!url) {
		url = target.parentElement.getAttribute('data-folder-link');
	}

	renderFolder(url);
}

function handleFolderClick(event) {

	var attr = event.target.getAttribute('data-folder-link');
	if (attr === null) {
		const elem = event.target.parentElement;
		attr = elem.getAttribute('data-folder-link');
	}
	const folder = dir + '/' + attr;
	renderFolder(folder);
}

function download(event) {

	var item_name = event.target.getAttribute('data-download-link');
	var type = event.target.getAttribute('data-download-type');

	if (!item_name) {
		const elem = event.target.parentElement;
		item_name = elem.getAttribute('data-download-link');
		type = elem.getAttribute('data-download-type');
	} 

	if (type == 'file') {
		window.location = dir.replace('folder', 'file') + '/' + item_name;
	} else {

		const url = `${dir}/${item_name}?download=true`;
		window.location = url;
	}
}

function calculate_size(size) {

	const prefixes = ['', 'K' , 'M', 'G', 'T', 'P'];
	var index = 0;

	while (size >= 1000) {
		size = size / 1024;
		index++;
	}

	var frac = size - parseInt(size);
	frac = frac * 100;
	frac = parseInt(frac);
	size = parseInt(size);

	size = `${size}.${frac} ${prefixes[index]}B`;

	return size;

}

function addItemToTable(file, type) {

	const icon = document.createElement('td');
	icon.innerHTML = `<img src="src/icons/${type}.png">`;
	icon.classList.add('clickable');

	const name = document.createElement('td');
	name.innerHTML = file.name;
	name.classList.add('clickable');

	const size = document.createElement('td');
	if (type == 'file')
		size.innerHTML = calculate_size(file.size);
	else 
		size.innerHTML = '';

	const typeElem = document.createElement('td');
	typeElem.innerHTML = type;

	const down = document.createElement('td');
	down.innerHTML = `<img src="src/icons/download.png">`;
	down.classList.add('clickable');
	//down.classList.add('download-option');
	down.classList.add('hoverable');
	down.classList.add('center-align');
	down.setAttribute('data-download-link', file.name);
	down.setAttribute('data-download-type', type);
	down.addEventListener('click', download);

	if (type == 'folder') {

		icon.addEventListener('click', handleFolderClick);
		icon.setAttribute('data-folder-link', file.name);

		name.addEventListener('click', handleFolderClick);
		name.setAttribute('data-folder-link', file.name);
	} else {

		icon.addEventListener('click', download);
		icon.setAttribute('data-download-link', file.name);
		icon.setAttribute('data-download-type', type);

		name.addEventListener('click', download);
		name.setAttribute('data-download-link', file.name);
		name.setAttribute('data-download-type', type);	

	}

	const tr = document.createElement('tr');
	tr.appendChild(icon);
	tr.appendChild(name);
	tr.appendChild(size);
	tr.appendChild(typeElem);
	tr.appendChild(down);
	tr.classList.add('file-list-item');
	//tr.classList.add('hoverable');

	const table = document.querySelector('#tbl-files');
	table.appendChild(tr);

}

function renderFolder(url) {

	const req = {

		method: 'GET',
		url: url,
		success: function(results) {

			const table = document.querySelector('#tbl-files');
			const headings = table.children[0];
			table.innerHTML = '';
			table.appendChild(headings);

			dir = url;

			const itemsCount = results.folders.length + results.files.length;
			if (itemsCount === 0) {
				$('#tbl-files').append('<tr class="flow-text">(Empty folder)</tr>');
				return;
			}

			results.folders.forEach(function(item) {
				addItemToTable(item, 'folder');
			});
			results.files.forEach(function(item) {
				addItemToTable(item, 'file');
			});

			breadcrumbs();

		},
		error: function(status) {
			M.toast({html: 'Error loading folder. Probably the root folder was changed on the server. Reloading in 3 seconds'});
			setTimeout( function() {
				window.location.reload();
			}, 3000);
		}
	}

	$.ajax(req);
}

function stickFooter() {

	const footer = document.querySelector('footer');
	const footerHeight = footer.offsetHeight;

	const non_footer = document.querySelector('.non-footer');
	non_footer.style.minHeight = ((window.innerHeight - footerHeight) / window.innerHeight) * 100 + "%";
}

renderFolder('/folders');

window.onresize = stickFooter;
stickFooter();