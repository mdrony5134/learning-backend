const http = require("http");
const path = require("path");

const filePath = path.join(__dirname, "./db/todo.json");
const fs = require("fs");

const server = http.createServer((req, res) => {
  console.log("Welcome todo api");
  //   res.end("Welcome todo api");
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathName = url.pathname;
  console.log(pathName);
  // all todos
  if (pathName === "/allTodos" && req.method === "GET") {
    const data = fs.readFileSync(filePath, { encoding: "utf-8" });
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        message: "All todos fetched successfully",
        todos: JSON.parse(data),
      }),
    );

    // create todo
  } else if (pathName === "/todos/addTodo" && req.method === "POST") {
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

    // single todo
  } else if (pathName === "/todo" && req.method === "GET") {
    const title = url.searchParams.get("title");

    const allTodos = JSON.parse(
      fs.readFileSync(filePath, { encoding: "utf-8" }),
    );
    const singleTodo = allTodos.find((todo) => todo.title === title);
    if (singleTodo) {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Todo fetched successfully",
          todo: singleTodo,
        }),
      );
    } else {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ message: "Todo not found" }));
    }

    // update todo
  } else if (pathName === "/todos/updateTodo" && req.method === "PATCH") {
    const title = url.searchParams.get("title");
    let data = "";

    req.on("data", (chunk) => {
      data += chunk.toString();
    });

    req.on("end", () => {
      const { body } = JSON.parse(data);
      const allTodos = JSON.parse(
        fs.readFileSync(filePath, { encoding: "utf-8" }),
      );
      const todoIndex = allTodos.findIndex((todo) => todo.title === title);
      allTodos[todoIndex].body = body;
      fs.writeFileSync(filePath, JSON.stringify(allTodos, null, 2), {
        encoding: "utf-8",
      });
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Todo updated successfully",
          todo: allTodos[todoIndex],
        }),
      );
    });

    // delete todo
  } else if (pathName === "/todos/deleteTodo" && req.method === "DELETE") {
    const title = url.searchParams.get("title");

    const allTodos = JSON.parse(
      fs.readFileSync(filePath, { encoding: "utf-8" }),
    );
    const filteredTodos = allTodos.filter((todo) => todo.title !== title);
    fs.writeFileSync(filePath, JSON.stringify(filteredTodos, null, 2), {
      encoding: "utf-8",
    });

    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Todo deleted successfully",
      }),
    );
  } else {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  }
});

server.listen(5000, () => {
  console.log("Server is listening on port 5000");
});
