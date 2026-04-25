"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

async function getAdminClient() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") throw new Error("Unauthorized")

  return supabase
}

// Categories Actions
export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  
  if (!name) return { error: "Name is required" }
  
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')

  try {
    const supabase = await getAdminClient()
    const { error } = await supabase.from("categories").insert({
      name,
      slug,
      description,
    })

    if (error) return { error: error.message }
    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function deleteCategory(id: string) {
  try {
    const supabase = await getAdminClient()
    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) return { error: error.message }
    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Posts Actions
export async function deleteAdminPost(id: string) {
  try {
    const supabase = await getAdminClient()
    const { error } = await supabase.from("posts").delete().eq("id", id)

    if (error) return { error: error.message }
    revalidatePath("/admin/posts")
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Comments Actions
export async function deleteAdminComment(id: string) {
  try {
    const supabase = await getAdminClient()
    const { error } = await supabase.from("comments").delete().eq("id", id)

    if (error) return { error: error.message }
    revalidatePath("/admin/comments")
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Users Actions
export async function toggleUserRole(id: string, currentRole: string) {
  try {
    const supabase = await getAdminClient()
    const newRole = currentRole === "admin" ? "user" : "admin"
    
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", id)

    if (error) return { error: error.message }
    revalidatePath("/admin/users")
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
