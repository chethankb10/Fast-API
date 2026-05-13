from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from itertools import count
import os
import re


class TodoItem(BaseModel):
    id: int
    title: str
    completed: bool = False


class TodoCreate(BaseModel):
    title: str


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None


app = FastAPI(title="Todo List API")

# Build allowed origins
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add production URLs from environment or defaults
render_url = os.getenv("RENDER_URL", "https://*.onrender.com")
vercel_url = os.getenv("VERCEL_URL")

if render_url and render_url != "https://*.onrender.com":
    allowed_origins.append(render_url)

if vercel_url:
    allowed_origins.append(f"https://{vercel_url}")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*\.(onrender|vercel)\.(com|app|dev)|http://localhost.*|http://127\.0\.0\.1.*",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

counter = count(1)
todos: List[TodoItem] = []


@app.get("/api/todos", response_model=List[TodoItem])
async def list_todos():
    return todos


@app.post("/api/todos", response_model=TodoItem, status_code=201)
async def create_todo(todo_create: TodoCreate):
    title = todo_create.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Title must not be empty")

    todo = TodoItem(id=next(counter), title=title)
    todos.append(todo)
    return todo


@app.put("/api/todos/{todo_id}", response_model=TodoItem)
async def update_todo(todo_id: int, todo_update: TodoUpdate):
    for item in todos:
        if item.id == todo_id:
            if todo_update.title is not None:
                item.title = todo_update.title.strip()
            if todo_update.completed is not None:
                item.completed = todo_update.completed
            return item

    raise HTTPException(status_code=404, detail="Todo not found")


@app.delete("/api/todos/{todo_id}", status_code=204)
async def delete_todo(todo_id: int):
    for index, item in enumerate(todos):
        if item.id == todo_id:
            todos.pop(index)
            return

    raise HTTPException(status_code=404, detail="Todo not found")
