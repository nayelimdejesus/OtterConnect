document.querySelector("button").addEventListener("click", login);


async function login(){

	//alert("logging in...");
	let username = document.querySelector("#username").value;
	let pwd = document.querySelector("#password").value;

	let url = "/api/userIn";
	let response = await fetch(url,
					{ method: 'post',
						body: JSON.stringify({"username": username,
									"password": pwd
						}),
						headers: {
							"Content-Type": "application/json",
								"Accept": "application/json"
						}
					
					
					});
		let data = await response.json();
		// console.log(data.authentication);

	if (data.authentication == "successful") {
		window.location.href = "/feed";
	} else {
	document.querySelector("#errorMsg").innerHTML = "Wrong credentials";
	}

	//console.log(username + "/" + pwd);

}