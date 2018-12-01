import WaitForObject from "./WaitForObject";

/**
 * Injects a script into DOM
 * @param {(string|Object[])} file_paths - Path of inject file
 * @param {boolean} add_ext_id - If its needed, add the extension id into element props
 * @returns {boolean} - Check whether if file injected or not 
 **/
let inject_it = async function(file_paths, add_ext_id) {
	let elm;
	let injected;
	let _return = true;

	if (!file_paths || file_paths.length === 0) {
		console.error("File path is required");
		_return = false;
	} else {
		if (typeof file_paths == "string") {
			file_paths = [file_paths];
		}

		for (let i = 0, file_path;
			(file_path = file_paths[i]); i++) {
			let file_name = file_path.split(".");

			if (file_name.length < 2) {
				console.error("Injected file name is incorrect: ", file_path);
				_return = false;
			} else {
				let extension_URL;

				if (typeof System != "undefined" && System.data.meta && System.data.meta.extension) {
					extension_URL = System.data.meta.extension.URL
				} else {
					console.warn("manually create extension url");
					extension_URL = "chrome-extension://" + chrome.runtime.id
				}

				let file_ext = (file_name).pop();
				let file_path_fixed = extension_URL + file_path;

				if (file_path.indexOf("http") >= 0) {
					file_path_fixed = file_path
				}

				switch (file_ext) {
					case "js":
						elm = document.documentElement;
						injected = document.createElement('script');
						injected.setAttribute('type', 'text/javascript');
						injected.setAttribute('src', file_path_fixed);

						if (typeof add_ext_id === "function") {
							injected.onload = function() {
								add_ext_id();
							};
						}

						if (add_ext_id && typeof add_ext_id !== "function") {
							//noinspection JSUnresolvedVariable
							injected.setAttribute('extension_URL', chrome.runtime.id || add_ext_id);
						}

						elm && elm.appendChild(injected);

						break;
					case "json":
						fetch(file_path_fixed)
							.then(response => response.json())
							.then(add_ext_id)
							.catch(add_ext_id);
						break;
					case "yml":
						fetch(file_path_fixed)
							.then(response => response.text())
							.then(add_ext_id)
							.catch(add_ext_id);
						break;
					case "ext_js":
						elm = document.documentElement;
						injected = document.createElement('script');

						injected.setAttribute('type', 'text/javascript');
						injected.setAttribute('src', file_path_fixed);

						elm && elm.prepend(injected);

						break;
					case "ext_css":
						elm = document.documentElement;
						injected = document.createElement('link');

						injected.setAttribute('rel', 'stylesheet');
						injected.setAttribute('type', 'text/css');
						injected.setAttribute('href', file_path_fixed);

						elm && elm.prepend(injected);

						break;
					case "css":
						let head = await WaitForObject("document.head");

						if (head) {
							injected = document.createElement('link');

							injected.setAttribute('rel', 'stylesheet');
							injected.setAttribute('type', 'text/css');
							injected.setAttribute('href', file_path_fixed);

							head && head.appendChild(injected);
						}

						break;
				}
			}
		}
	}

	return _return;
};

export default inject_it;
