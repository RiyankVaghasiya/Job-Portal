import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Job } from "../models/job.model.js";

//controller for post job
const postjob = asyncHandler(async (req, res) => {
  //fetch data from body
  const {
    title,
    description,
    requirements,
    salary,
    location,
    jobType,
    experience,
    position,
    companyId,
  } = req.body;

  //user information who creates the job
  const userId = req.user?._id;

  //check for missing data
  if (
    !title ||
    !description ||
    !requirements ||
    !salary ||
    !location ||
    !jobType ||
    !experience ||
    !position ||
    !companyId
  ) {
    throw new ApiError(400, "something is missing");
  }

  //crate entry in db
  const job = await Job.create({
    title,
    description,
    requirements: requirements.split(","),
    salary: Number(salary),
    location,
    jobType,
    experience,
    position,
    company: companyId,
    createdBy: userId,
  });

  //check if job is created or not
  const createdjob = await Job.findById(job?._id);
  if (!createdjob) {
    throw new ApiError(500, "something went wrong while creating job");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdjob, "job created successfully"));
});

//get all jobs and make filter
const getalljobs = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword || "";
  const query = {
    $or: [
      {
        title: { $regex: keyword, $options: "i" },
        description: { $regex: keyword, $options: "i" },
      },
    ],
  };

  //find job with above query in db
  const jobs = await Job.aggregate([
    // Step 1: Match jobs using the query
    {
      $match: query,
    },
    // Step 2: Lookup to populate the company details
    {
      $lookup: {
        from: "companies", // The name of the collection to join
        localField: "company", // Field from the Job collection (company ObjectId)
        foreignField: "_id", // Field from the Company collection (_id)
        as: "company", // Replace 'company' field with populated company details
      },
    },
    // Step 3: Unwind the company array to get a single object
    {
      $unwind: "$company",
    },
    // Step 4: Sort the jobs by createdAt in descending order
    {
      $sort: { createdAt: -1 },
    },
  ]);
  if (!jobs) {
    throw new ApiError(404, "jobs not found");
  }

  return res.status(200).json(new ApiResponse(200, jobs));
});

//get job using id (this is for student)
const getJobById = asyncHandler(async (req, res) => {
  const jobId = req.params?.id;
  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(404, "job not found");
  }

  return res.status(200).json(new ApiResponse(200, job));
});

//get job created by particular logged in user (this is for admin)
const getAdminJob = asyncHandler(async (req, res) => {
  const adminId = req.user?._id;

  const jobs = await Job.find({ createdBy: adminId });
  if (!jobs) {
    throw new ApiError(404, "jobs not found");
  }

  return res.status(200).json(new ApiResponse(200, jobs));
});
export { postjob, getalljobs, getJobById, getAdminJob };
