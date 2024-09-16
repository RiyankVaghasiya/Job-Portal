import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

//applyjob
const applyJob = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const jobId = req.params?.id;
  if (!jobId) {
    throw new ApiError(400, "job id is required");
  }

  //check if user is already appiled or not
  const existingApplication = await Application.findOne({
    job: jobId,
    applicant: userId,
  });
  if (existingApplication) {
    throw new ApiError(400, "you have already applied for this job");
  }

  //check if job is exist or not
  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, "job not found");
  }

  //create a new application
  const newApplication = await Application.create({
    job: jobId,
    applicant: userId,
  });

  //push newapplication in applications array in job model
  job.applications.push(newApplication._id);
  await job.save();

  return res.status(201).json(new ApiResponse(201, "job applied successfully"));
});

//get applied jobs by user
const getAppliedJobs = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  //   const application = await Application.find({ applicant: userId }).sort({
  //     createdAt: -1,
  //   });
  const query = { applicant: userId };
  const application = await Application.aggregate([
    // Step 1: Match application using the query
    {
      $match: query,
    },
    // Step 2: Lookup to populate the application details
    {
      $lookup: {
        from: "jobs", // The name of the collection to join
        localField: "job",
        foreignField: "_id", // Field from the job collection (_id)
        as: "job", // Replace 'job' field with populated job details
      },
    },
    // Step 3: Unwind the job array to get a single object
    {
      $unwind: "$job",
    },
    {
      $lookup: {
        from: "companies",
        localField: "job.company",
        foreignField: "_id",
        as: "job.company",
      },
    },
    {
      $unwind: "$job.company",
    },
    // Step 4: Sort the jobs by createdAt in descending order
    {
      $sort: { createdAt: -1 },
    },
  ]);
  if (!application) {
    throw new ApiError(404, "job not found");
  }
  return res.status(201).json(new ApiResponse(201, application));
});

//get applicant (this is for admin)(using this admin can see that how many students apply for any perticular job)
const getApplicant = asyncHandler(async (req, res) => {
  const jobId = req.params?.id;
  const job = await Job.findById(jobId);

  const applicants = await Job.aggregate([
    // Step 1: Match jobs using the query
    {
      $match: job,
    },
    // Step 2: Lookup to populate the company details
    {
      $lookup: {
        from: "applications", // The name of the collection to join
        localField: "applications", // Field from the Job collection (company ObjectId)
        foreignField: "_id", // Field from the Company collection (_id)
        as: "applications", // Replace 'company' field with populated company details
      },
    },
    // Step 3: Unwind the company array to get a single object
    {
      $unwind: "$applications",
    },
    {
      $lookup: {
        from: "users",
        localField: "applications.applicant",
        foreignField: "_id",
        as: "applications.applicant",
      },
    },
    {
      $unwind: "$applications.applicant",
    },
    {
      $project: {
        "applications.applicant.password": 0, // Exclude password field
        "applications.applicant.refreshToken": 0,
      },
    },
    // Step 4: Sort the jobs by createdAt in descending order
    {
      $sort: { createdAt: -1 },
    },
  ]);

  if (!applicants) {
    throw new ApiError(404, "No student apply for this job");
  }
  return res.status(200).json(new ApiResponse(200, applicants));
});

//update status
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const applicationId = req.params?.id;
  if (!status) {
    throw new ApiError(400, "status is required");
  }

  //find application using application id
  const application = await Application.findById(applicationId);
  if (!application) {
    throw new ApiError(404, "application not found");
  }

  //updating status
  application.status = status.toLowerCase();
  await application.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "status updated successfully"));
});
export { applyJob, getAppliedJobs, getApplicant, updateStatus };
