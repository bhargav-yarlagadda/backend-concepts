// tRPC Demo Page: Query vs Mutation, Error Handling, Input Validation, Protected Procedures
"use client";
import { trpc } from "@/utils/trpc";
import React, { useState } from "react";

export default function TrpcDemo() {
  // Query: greet (with input)
  const [name, setName] = useState("");
  const greet = trpc.hello.greet.useQuery({ name }, { enabled: !!name });

  // Mutation: saveMessage
  const [msgName, setMsgName] = useState("");
  const [msg, setMsg] = useState("");
  const saveMessage = trpc.hello.saveMessage.useMutation();

  // Query: get all posts
  const posts = trpc.post.all.useQuery();

  // Mutation: create post (protected)
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const createPost = trpc.post.create.useMutation();

  return (
    <div
      style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 32 }}>tRPC Demo</h1>

      {/* Greet Section */}
      <section
        style={{
          border: "1px solid #eee",
          borderRadius: 8,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <h2>Greet (Zod input validation)</h2>
        <label htmlFor="greet-name">Name:</label>
        <input
          id="greet-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          style={{ marginLeft: 8, marginRight: 8 }}
        />
        <div style={{ marginTop: 8, color: greet.error ? "red" : "#222" }}>
          {greet.isLoading && name
            ? "Loading..."
            : greet.error
            ? greet.error.message
            : greet.data
            ? greet.data
            : ""}
        </div>
      </section>

      {/* Save Message Section */}
      <section
        style={{
          border: "1px solid #eee",
          borderRadius: 8,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <h2>Save Message (Zod validation)</h2>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="msg-name">Name:</label>
          <input
            id="msg-name"
            value={msgName}
            onChange={(e) => setMsgName(e.target.value)}
            placeholder="Your name"
            style={{ marginLeft: 8 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="msg-message">Message:</label>
          <input
            id="msg-message"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Message (min 3 chars)"
            style={{ marginLeft: 8 }}
          />
        </div>
        <button
          onClick={() => saveMessage.mutate({ name: msgName, message: msg })}
          disabled={!msgName || !msg}
          style={{ padding: "2px 10px" }}
        >
          Save Message
        </button>
        <div
          style={{ marginTop: 8, color: saveMessage.error ? "red" : "green" }}
        >
          {saveMessage.isPending
            ? "Saving..."
            : saveMessage.error
            ? saveMessage.error.message
            : saveMessage.data
            ? `Saved at ${saveMessage.data.savedAt}`
            : ""}
        </div>
      </section>

      {/* Posts Section */}
      <section
        style={{
          border: "1px solid #eee",
          borderRadius: 8,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <h2>Posts (Nested Router)</h2>
        {posts.isLoading ? (
          <div>Loading posts...</div>
        ) : posts.error ? (
          <div style={{ color: "red" }}>{posts.error.message}</div>
        ) : (
          <ul style={{ paddingLeft: 20 }}>
            {posts.data?.map((p) => (
              <li key={p.id} style={{ marginBottom: 4 }}>
                <b>{p.title}</b> by {p.author}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Create Post Section */}
      <section
        style={{ border: "1px solid #eee", borderRadius: 8, padding: 20 }}
      >
        <h2>Create Post (Protected, requires auth)</h2>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="post-title">Title:</label>
          <input
            id="post-title"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Title"
            style={{ marginLeft: 8 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="post-content">Content:</label>
          <input
            id="post-content"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Content"
            style={{ marginLeft: 8 }}
          />
        </div>
        <button
          onClick={() =>
            createPost.mutate({ title: postTitle, content: postContent })
          }
          disabled={!postTitle || !postContent}
          style={{ padding: "2px 10px" }}
        >
          Create Post
        </button>
        <div
          style={{ marginTop: 8, color: createPost.error ? "red" : "green" }}
        >
          {createPost.isPending
            ? "Creating..."
            : createPost.error
            ? createPost.error.message
            : createPost.data
            ? `Created post: ${createPost.data.title}`
            : ""}
        </div>
      </section>
    </div>
  );
}
