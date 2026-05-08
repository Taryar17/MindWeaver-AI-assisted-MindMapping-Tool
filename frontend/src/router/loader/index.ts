import { redirect } from "react-router-dom";
import { authApi } from "../../api";
import { mindmapApi } from "@/api/mindmap";

export const loginLoader = async () => {
  try {
    const response = await authApi.get("auth-check");
    if (response.status !== 200) {
      return null;
    }
    return redirect("/");
  } catch (error) {
    return null;
    console.log("loginLoader error: ", error);
  }
};

export const protectedLoader = async () => {
  try {
    const res = await authApi.get("auth-check");

    if (res.status === 200) {
      return null; // user is authenticated
    }

    return redirect("/login");
  } catch (error) {
    return redirect("/login");
    console.log("loginLoader error: ", error);
  }
};

export const draftsLoader = async () => {
  try {
    const mindMaps = await mindmapApi.getUserMindMaps();
    return { mindMaps };
  } catch (error) {
    console.error("Failed to load drafts:", error);
    return { mindMaps: [] };
  }
};

export const currentWorkLoader = async () => {
  try {
    const mindMaps = await mindmapApi.getUserMindMaps();
    // Get the most recent mind map (first in the list since they're ordered by updatedAt desc)
    const latestMindMap = mindMaps.length > 0 ? mindMaps[0] : null;
    return { latestMindMap };
  } catch (error) {
    console.error("Failed to load current work:", error);
    return { latestMindMap: null };
  }
};
