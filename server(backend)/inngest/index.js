import { Inngest } from "inngest";
import { prisma } from "../configs/prisma.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "TeamSync" });

//inngest function to save user data to database 
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk"},{event: "clerk/user.created" },
  async ({event}) => {
    const data = event;
    //storing user in db~
    await prisma.user.create({
      data: {
        id: data.id,
        email: data?.email_addresses[0]?.email_address,
        Name: data?.first_name + " " + data?.last_name,
        image: data?.image_url,
      },
    }); 
  }
);
    
//inngest function to delete user from database
const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-deletion-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const data = event;
    await prisma.user.delete({
      where: {
        id: data.id,
      },
    });
  }
);

//innest function to update user data in database
const syncUserUpdate = inngest.createFunction(
  { id: "sync-user-update-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const data = event;
    await prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        email: data?.email_addresses[0]?.email_address,
        Name: data?.first_name + " " + data?.last_name,
        image: data?.image_url,
      },
    });
  }
);      

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation,syncUserDeletion,syncUserUpdate];