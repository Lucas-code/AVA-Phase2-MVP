"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

type MessageData = {
  from: string;
  message: string;
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [question, setQuestion] = useState();
  const [convoData, setConvoData] = useState<MessageData[]>([]);
  const [convoFinished, setConvoFinished] = useState(false);
  const [modelResponseLoading, setModelResponseLoading] = useState(true);

  async function generateQuestion() {
    setModelResponseLoading(true);
    await axios
      .get("/api/generateQuestion")
      .then((resp) => {
        if (resp.status === 200) {
          setQuestion(resp.data.result);
        }
        setConvoData((data) => [
          ...data,
          {
            from: "model",
            message: resp.data.result,
          },
        ]);
      })
      .catch((e) => {
        setConvoData((data) => [
          ...data,
          {
            from: "model",
            message: "Failed to get a question. reload this page to try again.",
          },
        ]);
        setConvoFinished(true);
      })
      .finally(() => {
        setMounted(true);
        setModelResponseLoading(false);
      });
  }

  async function generateFeedback(e: any) {
    setConvoData((data) => [
      ...data,
      {
        from: "user",
        message: e.target.elements.response.value,
      },
    ]);
    setModelResponseLoading(true);
    await axios
      .post("/api/generateFeedback", {
        question: question,
        userInput: e.target.elements.response.value,
      })
      .then((resp) => {
        setConvoData((data) => [
          ...data,
          {
            from: "model",
            message: resp.data.result,
          },
        ]);
        setConvoFinished(true);
      })
      .catch((e) => {
        setConvoData((data) => [
          ...data,
          {
            from: "model",
            message:
              e.status === 400
                ? "We cannot provide feedback on this answer. Please try again."
                : "Something went wrong when collecting feedback.",
          },
        ]);
      })
      .finally(() => {
        setModelResponseLoading(false);
      });
  }

  useEffect(() => {
    const effect = async () => {
      await generateQuestion();
    };
    effect();
  }, []);

  return !mounted ? (
    <></>
  ) : (
    <div>
      {convoData.map((data, i) => (
        <div
          key={i}
          className={`${
            data.from === "user"
              ? "text-red-200 bg-linear-to-b from-blue-400 to-blue-700"
              : "bg-linear-to-b from-violet-400 to-blue-700"
          } flex p-5 mx-10 my-3`}
        >
          <div>
            <p>{data.from === "model" ? "🤖" : "🧍"}</p>
          </div>
          <p>{data.message}</p>
        </div>
      ))}
      {!convoFinished && !modelResponseLoading && (
        <div className="bg-linear-to-b from-blue-400 to-blue-700 p-5 mx-10 my-3">
          <form onSubmit={generateFeedback}>
            <div className="flex flex-col">
              <label htmlFor="response">
                Your response (1000 characters max):
              </label>
              <input
                id="response"
                type="text"
                placeholder="Please Enter Your Answer Here"
                maxLength={1000}
                required
              />
              <button
                type="submit"
                className="bg-blue-300 rounded-lg p-2 w-[60px]"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
