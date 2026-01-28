const http = require("http");
const path = require("path");

const filePath = path.join(__dirname, "./db/todo.json");
const fs = require("fs");

const server = http.createServer((req, res) => {
  console.log("Welcome todo api");
  //   res.end("Welcome todo api");
  // all todos
  if (req.url === "/allTodos" && req.method === "GET") {
    const data = fs.readFileSync(filePath, { encoding: "utf-8" });
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        message: "All todos fetched successfully",
        todos: JSON.parse(data),
      }),
    );
  } else if (req.url === "/todos/addTodo" && req.method === "POST") {
    let data = "";

    req.on("data", (chunk) => {
      // console.log(chunk)
      data += chunk.toString();
    });

    req.on("end", () => {
      console.log(data);
      const { title, body } = JSON.parse(data);
      const date = new Date();
      const todo = {
        id: date.getTime(),
        title,
        body,
        date: date.toISOString(),
      };
      const allTodos = JSON.parse(
        fs.readFileSync(filePath, { encoding: "utf-8" }),
      );
      allTodos.push(todo);
      fs.writeFileSync(filePath, JSON.stringify(allTodos, null, 4), {
        encoding: "utf-8",
      });
      res.writeHead(201, { "content-type": "application/json" });
      res.end(JSON.stringify({ message: "Todo added successfully", todo }));
    });
  } else {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  }
});

server.listen(5000, () => {
  console.log("Server is listening on port 5000");
});
