'use server';

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

interface Params {
    userId: string,
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string,
}


export async function updateUser({
    userId,
    bio,
    name,
    path,
    username,
    image,
  }: Params): Promise<void> {
    try {
      connectToDB();
  
      await User.findOneAndUpdate(
        { id: userId },
        {
          username: username.toLowerCase(),
          name,
          bio,
          image,
          onboarded: true,
        },
        { upsert: true }
      );
  
      if (path === "/profile/edit") {
        revalidatePath(path);
      }
    } catch (error: any) {
      throw new Error (`Failed to create/update user: ${error.message}`)
    }
  }

export async function fetchUser(userId: string){
  try{
    connectToDB();
    return await User
    .findOne({ id:userId })
    // .populate({
    //   path: 'communities',
    //   model: Community
    // })
  } catch (error: any) {
    throw new Error (`Failed to fetch user: ${error.message}`)
  }
}

export async function fetchUserPosts (userId: string) {
  try {
    connectToDB();

    // Find all threads authored by user with the given userId
    const threads = await User.findOne ({ id: userId })
      .populate ({
        path: 'threads',
        model: Thread,
        populate: {
          path: 'children',
          model: Thread,
          populate: {
            path: 'author',
            model: User,
            select: 'name image id'
          }
        }
      })

      return threads;
  } catch (error: any) {
    throw new Error (`Fail to fetch posts: ${error.message}`)
  }
}

export async function fecthUsers ({ 
  userId,
  searchString = '',
  pageNumber = 1,
  pageSize = 20,
  sortBy = 'desc'
} : {
  userId: string,
  searchString?: string,
  pageNumber?: number,
  pageSize?: number,
  sortBy?: SortOrder
}) {
  try {
    connectToDB();

    // Calculate the number of users to skip, based on page number and size 
    const skipAmount = (pageNumber - 1) * pageSize;

    //Case insensitive regex
    const regex = new RegExp(searchString, 'i');

    //Initial query to get the users
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId }
    }

    // Searches for the user, by username | name 
    if(searchString.trim() !== '') {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ]
    }

    // Define sort options
    const sortOptions = { createdAt: sortBy }

    const usersQuery = User.find(query)
    .sort(sortOptions)
    .skip(skipAmount)
    .limit(pageSize);

    // To know the number of pages needed
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };

  } catch (error: any) {
    throw new Error (`Failed to fetch users: ${error.message}`)
  }
}

export async function getActivity (userId: string) {
  try {
    connectToDB();
    
    // find all threads created by the user
    const userThreads = await Thread.find({ author: userId });

    //Collect all the child thread ids (replies) from the 'children' field
    const childThreadId = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    },[])

    //Get acces to all the replies excluding the ones created by the currentUser
    const replies = await Thread.find({
      _id: { $in: childThreadId },
      author: { $ne: userId }
    })
    .populate ({
      path: 'author',
      model: User,
      select: 'name image _id'
    })

    return replies;

  } catch (error: any) {
    throw new Error (`Failed to fetch activity: ${error.message}`)
  }
}