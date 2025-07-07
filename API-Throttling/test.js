const URL = "http://localhost:3000/";
for (let index = 0; index < 100; index++) {
    const response = await fetch(URL);
    console.log(index, response.status, await response.text());
}