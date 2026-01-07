import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "TeamSync" });

//inngest function to save user data to database 
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const data = event.data;

    await prisma.user.create({
      data: {
        id: data.id,
        email: data.email_addresses[0]?.email_address ?? "",
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
        image: data.image_url ?? "",
      },
    });

    return {
      success: true,
      userId: data.id,
    };
  }
);

    
//inngest function to delete user from database
const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-deletion-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const userId = event.data.id;

    await prisma.user.deleteMany({
      where: { id: userId },
    });

    return {
      success: true,
      deletedUserId: userId,
    };
  }
);


//innest function to update user data in database
const syncUserUpdate = inngest.createFunction(
  { id: "sync-user-update-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const data = event.data;

    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data.email_addresses[0]?.email_address ?? "",
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
        image: data.image_url ?? "",
      },
    });

    return {
      success: true,
      userId: data.id,
    };
  }
);

//inngest function to save workspace data to database
const syncWorkspaceCreation = inngest.createFunction(
  { id: "sync-workspace-from-clerk" },
  { event: "clerk/workspace.created" },
  async ({ event }) => {
    const data = event.data;

    await prisma.workspace.create({
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        ownerId: data.created_by,
        image_url: data.image_url || null,
      },
    });
    //add owner as member of workspace
    await prisma.workspaceMember.create({
      data: {
        userId: data.created_by,
        workspaceId: data.id,
        role: "ADMIN",
      },
    });
    return {
      success: true,
      workspaceId: data.id,
    };
  }
);

//inngest function to update workspace data in database
const syncWorkspaceUpdate = inngest.createFunction(
  { id: "sync-workspace-update-from-clerk" },
  { event: "clerk/organization.updated" },
  async ({ event }) => {
    const data = event.data;

    await prisma.workspace.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        image_url: data.image_url || null,
      },
    });
    return {
      success: true,
      workspaceId: data.id,
    };
  }
);

//inngest function to delete workspace from database
const syncWorkspaceDeletion = inngest.createFunction(
  { id: "sync-workspace-deletion-from-clerk" },
  { event: "clerk/organization.deleted" },
  async ({ event }) => {
    const workspaceId = event.data.id;

    await prisma.workspace.delete({
      where: { id: data.id },
    });

    return {
      success: true,
      deletedWorkspaceId: data.id,
    };
  }
);

//inngest function to save workspace member data to database
const syncWorkspaceMemberCreation = inngest.createFunction(
  { id: "sync-workspace-member-addition-from-clerk" },
  { event: "clerk/organizationInvitation.accepted" },
  async ({ event }) => {
    const data = event.data;

    await prisma.workspaceMember.create({
      data: {
        userId: data.user_id,
        workspaceId: data.organization_id,
        role: String(data.role_name).toUpperCase(),
      },
    });

    return {
      success: true,
      workspaceId: data.organization_id,
      userId: data.user_id,
    };
  }
);


export const functions = [syncUserCreation,syncUserDeletion,syncUserUpdate,syncWorkspaceCreation,syncWorkspaceUpdate,syncWorkspaceDeletion,syncWorkspaceMemberCreation];