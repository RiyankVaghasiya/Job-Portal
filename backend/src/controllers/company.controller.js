import { Company } from "../models/company.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const registerCompany = asyncHandler(async (req, res) => {
  //get data of company from the body
  const { companyName, description, website, location } = req.body;
  if (companyName === "") {
    throw new ApiError(400, "companyName is required");
  }

  //check in db for if any company exist with same name
  const existedCompany = await Company.findOne({ companyName });
  if (existedCompany) {
    throw new ApiError(409, "Company name is already exist");
  }

  //if not then register company in db
  const company = await Company.create({
    companyName,
    description,
    website,
    location,
    userId: req.user?._id,
  });

  //check in db that company is regiter or not
  const createdCompany = await Company.findById(company._id);
  if (!createdCompany) {
    throw new ApiError(
      500,
      "something went wrong while registring the company"
    );
  }

  //send success response
  return res
    .status(201)
    .json(
      new ApiResponse(201, createdCompany, "Company is registered Successfully")
    );
});

//here we fetch all company created by logged in user
const getCompany = asyncHandler(async (req, res) => {
  const userId = req.user?._id; //  userId of logged in user
  const companies = await Company.find({ userId });
  if (!companies) {
    throw new ApiError(404, "Companies not found");
  }

  return res.status(200).json(new ApiResponse(200, companies));
});

//here we get any perticular company using compnie's id
const getCompanyById = asyncHandler(async (req, res) => {
  const companyId = req.params?.id;
  const company = await Company.findById(companyId);

  if (!company) {
    throw new ApiError(404, "Companies not found");
  }
  return res.status(200).json(new ApiResponse(200, company));
});

//update company information
const updateCompanyinfo = asyncHandler(async (req, res) => {
  //fetch company details to update
  const { companyName, description, website, location } = req.body;

  const company = await Company.findByIdAndUpdate(
    req.params?.id,
    {
      companyName,
      description,
      website,
      location,
    },
    {
      new: true,
    }
  );

  if (!company) {
    throw new ApiError(400, "Company not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, company, "company details updated successfully")
    );
});

export { registerCompany, getCompany, getCompanyById, updateCompanyinfo };
