"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModal";
import { LoaderCircle } from "lucide-react";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from 'uuid';
import { db } from "@/utils/db";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const inputPrompt = `Job position: ${jobPosition}, Job Description: ${jobDescription}, Years of Experience: ${jobExperience}, Depends on Job Position, Job Description and Years of Experience give us ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} Interview question along with Answer in JSON format, Give us question and Answer field on JSON,Each question and answer should be in the format:
  {
    "question": "Your question here",
    "answer": "Your answer here"
  }`;

    try {
      const result = await chatSession.sendMessage(inputPrompt);
      const responseText = await result.response.text();
      console.log("Full AI response:", responseText);

      let mockResponse;
      try {
        // First, try to parse the entire response as JSON
        mockResponse = JSON.parse(responseText);
      } catch (parseError) {
        // If parsing fails, try to extract JSON using a more forgiving regex
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          mockResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Unable to extract valid JSON from the response");
        }
      }

      console.log("Parsed mock response:", mockResponse);

      if (Array.isArray(mockResponse) && mockResponse.length > 0) {
        setJsonResponse(mockResponse);
        const jsonString = JSON.stringify(mockResponse);
        const res = await db.insert(MockInterview)
          .values({
            mockId: uuidv4(),
            jsonMockResp: jsonString,
            jobPosition: jobPosition,
            jobDesc: jobDescription,
            jobExperience: jobExperience,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            createdAt: moment().format('DD-MM-YYYY'),
          }).returning({ mockId: MockInterview.mockId });
        setLoading(false);
        router.push(`dashboard/interview/${res[0]?.mockId}`);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error processing interview questions:", error);
      // Handle the error appropriately (e.g., show an error message to the user)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setOpenDialog(true)}
      >
        <h1 className="font-bold text-lg text-center">+ Add New</h1>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-2xl">
              Tell us more about your job Interviewing
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <form onSubmit={onSubmit}>
              <div>
                <p>
                  Add details about your job position/role, job description, and
                  years of experience
                </p>
                <div className="mt-7 my-3">
                  <label>Job Role/Job Position</label>
                  <Input
                    placeholder="Ex. Full Stack Developer"
                    required
                    onChange={(e) => setJobPosition(e.target.value)}
                  />
                </div>
                <div className="my-3">
                  <label>Job Description/Tech Stack (In short)</label>
                  <Textarea
                    placeholder="Ex. React, Angular, NodeJs, MySql etc"
                    required
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
                <div className="my-3">
                  <label>Years of Experience</label>
                  <Input
                    placeholder="Ex. 5"
                    type="number"
                    min="1"
                    max="70"
                    required
                    onChange={(e) => setJobExperience(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-5 justify-end">
                <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin" /> Generating from AI
                    </>
                  ) : (
                    'Start Interview'
                  )}
                </Button>
              </div>
            </form>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
