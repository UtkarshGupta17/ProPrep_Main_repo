"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import { Mic, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModal";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
}) => {
  const [typedAnswer, setTypedAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      toast("Web Speech API is not available in this browser 🤷‍");
      return;
    }
    const recognitionInstance = new window.webkitSpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = "en-US";

    recognitionInstance.onresult = (event) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        interimTranscript += event.results[i][0].transcript;
      }

      setTypedAnswer(interimTranscript);
    };

    setRecognition(recognitionInstance);
  }, []);

  const StartStopRecording = async () => {
    if (isRecording) {
      recognition.stop();
      if (typedAnswer?.length < 10) {
        setLoading(false);
        toast("Error while saving your answer, please record again");
        return;
      }
    } else {
      recognition.start();
    }
    setIsRecording(!isRecording);
  };

  const UpdateUserAnswer = async () => {
    if (typedAnswer.length < 10) {
      toast("Answer is too short, please provide a more detailed answer");
      return;
    }
    console.log(typedAnswer, "########");
    setLoading(true);
    const combinedAnswer = typedAnswer.trim();
    const feedbackPrompt =
      "Question:" +
      mockInterviewQuestion[activeQuestionIndex]?.question +
      ", User Answer:" +
      combinedAnswer +
      ",Depends on question and user answer for given interview question " +
      " please give use rating for answer and feedback as area of improvement if any" +
      " in just 3 to 5 lines to improve it in JSON format with rating field and feedback field";
    
    const result = await chatSession.sendMessage(feedbackPrompt);

    const mockJsonResp = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");

    console.log(
      mockJsonResp
    );
    const JsonfeedbackResp = JSON.parse(mockJsonResp);
    const resp = await db.insert(UserAnswer).values({
      mockIdRef: interviewData?.mockId,
      question: mockInterviewQuestion[activeQuestionIndex]?.question,
      correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
      userAns: combinedAnswer,
      feedback: JsonfeedbackResp?.feedback,
      rating: JsonfeedbackResp?.rating,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      createdAt: moment().format("DD-MM-YYYY"),
    });

    if (resp) {
      toast("User Answer recorded successfully");
      setTypedAnswer("");
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center flex-col">
      <div className="flex flex-col my-10 justify-center items-center bg-black rounded-lg p-5">
        <Image
          src={"/webcam.png"}
          width={200}
          height={200}
          className="absolute"
          alt="webcam"
          priority
        />
        <Webcam
          style={{ height: 300, width: "100%", zIndex: 10 }}
          mirrored={true}
        />
      </div>
      <Button
        disabled={loading}
        variant="outline"
        className="my-1"
        onClick={StartStopRecording}
      >
        {isRecording ? (
          <h2 className="text-red-600 items-center animate-pulse flex gap-2 my-1">
            <StopCircle /> Stop Recording...
          </h2>
        ) : (
          <h2 className="text-primary flex gap-2 items-center my-1">
            <Mic /> Record Answer
          </h2>
        )}
      </Button>
      <textarea
        className="w-full p-2 border rounded"
        rows="5"
        placeholder="Speak or type your answer here..."
        value={typedAnswer}
        onChange={(e) => setTypedAnswer(e.target.value)}
        disabled={loading}
      ></textarea>
      <Button
        disabled={loading}
        variant="outline"
        className="my-1"
        onClick={UpdateUserAnswer}
      >
        Submit Answer
      </Button>
    </div>
  );
};

export default RecordAnswerSection;
