import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  ChefHat,
  ShieldCheck,
  Trash2,
  Pencil,
  Plus,
  X,
  RefreshCw,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

export const Route = createFileRoute("/admin")({
  component: AdminPage,

  head: () => ({
    meta: [
      {
        title: "Admin Dashboard — Culinary Diary",
      },
    ],
  }),
});


interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}


interface AdminRecipe {
  _id: string;
  title: string;
  emoji: string;
  blurb?: string;
  tags: string[];
  ingredients: string[];
  instructions: string;
  prepTime: number;
  calories?: number;
  difficulty?: "Easy" | "Medium" | "Hard";
}


interface Stats {
  users: number;
  recipes: number;
}


const emptyRecipe = {
  title: "",
  emoji: "🍳",
  blurb: "",
  tags: "",
  ingredients: "",
  instructions: "",
  prepTime: "0",
  calories: "300",
  difficulty: "Easy",
};


function AdminPage() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    recipes: 0,
  });

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [editingRecipe, setEditingRecipe] =
    useState<AdminRecipe | null>(null);

  const [recipeForm, setRecipeForm] = useState(emptyRecipe);

  const [savingRecipe, setSavingRecipe] = useState(false);


  async function loadAdminData() {
    try {
      setLoading(true);
      setError("");

      const [
        dashboardResponse,
        usersResponse,
        recipesResponse,
      ] = await Promise.all([
        fetch("http://localhost:5000/api/admin/dashboard", {
          credentials: "include",
        }),

        fetch("http://localhost:5000/api/admin/users", {
          credentials: "include",
        }),

        fetch("http://localhost:5000/api/admin/recipes", {
          credentials: "include",
        }),
      ]);


      const dashboardData = await dashboardResponse.json();
      const usersData = await usersResponse.json();
      const recipesData = await recipesResponse.json();


      if (!dashboardResponse.ok) {
        throw new Error(
          dashboardData.message || "Admin access denied."
        );
      }

      if (!usersResponse.ok) {
        throw new Error(
          usersData.message || "Could not load users."
        );
      }

      if (!recipesResponse.ok) {
        throw new Error(
          recipesData.message || "Could not load recipes."
        );
      }


      setStats(dashboardData.stats);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setRecipes(
        Array.isArray(recipesData) ? recipesData : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not load admin data."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadAdminData();
  }, []);


  async function deleteUser(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;


    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setUsers((current) =>
        current.filter((user) => user._id !== id)
      );

      setStats((current) => ({
        ...current,
        users: current.users - 1,
      }));
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Could not delete user."
      );
    }
  }


  async function changeUserRole(
    user: AdminUser
  ) {
    const newRole =
      user.role === "admin"
        ? "user"
        : "admin";


    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${user._id}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error(data.message);
      }


      setUsers((current) =>
        current.map((item) =>
          item._id === user._id
            ? {
                ...item,
                role: newRole,
              }
            : item
        )
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Could not change user role."
      );
    }
  }


  function startCreateRecipe() {
    setEditingRecipe(null);
    setRecipeForm(emptyRecipe);
    setShowRecipeForm(true);
  }


  function startEditRecipe(recipe: AdminRecipe) {
    setEditingRecipe(recipe);

    setRecipeForm({
      title: recipe.title,
      emoji: recipe.emoji || "🍳",
      blurb: recipe.blurb || "",
      tags: recipe.tags?.join(", ") || "",
      ingredients: recipe.ingredients?.join("\n") || "",
      instructions: recipe.instructions || "",
      prepTime: String(recipe.prepTime || 0),
      calories: String(recipe.calories || 300),
      difficulty: recipe.difficulty || "Easy",
    });

    setShowRecipeForm(true);
  }


  async function saveRecipe(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setSavingRecipe(true);


      const recipeData = {
        title: recipeForm.title.trim(),
        emoji: recipeForm.emoji.trim() || "🍳",
        blurb: recipeForm.blurb.trim(),

        tags: recipeForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),

        ingredients: recipeForm.ingredients
          .split("\n")
          .map((ingredient) => ingredient.trim())
          .filter(Boolean),

        instructions: recipeForm.instructions.trim(),

        prepTime: Number(recipeForm.prepTime) || 0,

        calories: Number(recipeForm.calories) || 300,

        difficulty: recipeForm.difficulty,
      };


      if (!recipeData.title) {
        throw new Error("Recipe title is required.");
      }

      if (recipeData.ingredients.length === 0) {
        throw new Error("Add at least one ingredient.");
      }

      if (!recipeData.instructions) {
        throw new Error("Instructions are required.");
      }


      const url = editingRecipe
        ? `http://localhost:5000/api/admin/recipes/${editingRecipe._id}`
        : "http://localhost:5000/api/admin/recipes";


      const response = await fetch(url, {
        method: editingRecipe ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify(recipeData),
      });


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.message || "Could not save recipe."
        );
      }


      setShowRecipeForm(false);
      setEditingRecipe(null);
      setRecipeForm(emptyRecipe);

      await loadAdminData();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Could not save recipe."
      );
    } finally {
      setSavingRecipe(false);
    }
  }


  async function deleteRecipe(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this recipe?"
    );

    if (!confirmed) return;


    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/recipes/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error(data.message);
      }


      setRecipes((current) =>
        current.filter(
          (recipe) => recipe._id !== id
        )
      );

      setStats((current) => ({
        ...current,
        recipes: current.recipes - 1,
      }));
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Could not delete recipe."
      );
    }
  }


  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">

        <Sidebar />


        <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">

          {/* HEADER */}

          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-xs uppercase tracking-widest text-sage">
                Administration
              </p>

              <h1 className="mt-1 font-display text-3xl sm:text-4xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Manage Culinary Diary.
              </p>
            </div>


            <button
              onClick={loadAdminData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:border-sage transition disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />

              Refresh
            </button>

          </header>


          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-3xl border border-destructive/20 bg-destructive/5 p-5">
              <p className="text-sm font-medium text-destructive">
                {error}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                You must be logged in as an administrator.
              </p>
            </div>
          )}


          {!error && (
            <>

              {/* STATS */}

              <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-3xl border border-border bg-card p-6">

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Users
                      </p>

                      <p className="mt-2 font-display text-4xl">
                        {loading ? "—" : stats.users}
                      </p>
                    </div>

                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sage-soft text-sage">
                      <Users className="h-6 w-6" />
                    </div>

                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    Registered accounts
                  </p>

                </div>


                <div className="rounded-3xl border border-border bg-card p-6">

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Recipes
                      </p>

                      <p className="mt-2 font-display text-4xl">
                        {loading ? "—" : stats.recipes}
                      </p>
                    </div>

                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-beige">
                      <ChefHat className="h-6 w-6" />
                    </div>

                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    Recipes in MongoDB
                  </p>

                </div>

              </section>


              {/* USERS */}

              <section className="mt-8">

                <div className="flex items-center gap-3">

                  <Users className="h-5 w-5 text-sage" />

                  <div>
                    <h2 className="font-display text-2xl">
                      Users
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      Manage registered users.
                    </p>
                  </div>

                </div>


                <div className="mt-4 overflow-x-auto rounded-3xl border border-border bg-card">

                  <table className="w-full min-w-[700px] text-sm">

                    <thead className="border-b border-border bg-beige/40">

                      <tr>
                        <th className="px-5 py-4 text-left font-medium">
                          Name
                        </th>

                        <th className="px-5 py-4 text-left font-medium">
                          Email
                        </th>

                        <th className="px-5 py-4 text-left font-medium">
                          Role
                        </th>

                        <th className="px-5 py-4 text-right font-medium">
                          Actions
                        </th>
                      </tr>

                    </thead>


                    <tbody>

                      {users.map((user) => (

                        <tr
                          key={user._id}
                          className="border-b border-border last:border-0"
                        >

                          <td className="px-5 py-4 font-medium">
                            {user.firstName} {user.lastName}
                          </td>

                          <td className="px-5 py-4 text-muted-foreground">
                            {user.email}
                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                user.role === "admin"
                                  ? "bg-sage-soft text-sage"
                                  : "bg-beige text-muted-foreground"
                              }`}
                            >
                              {user.role}
                            </span>

                          </td>


                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                onClick={() =>
                                  changeUserRole(user)
                                }
                                className="rounded-xl border border-border px-3 py-2 text-xs hover:border-sage transition"
                              >
                                {user.role === "admin"
                                  ? "Make User"
                                  : "Make Admin"}
                              </button>


                              <button
                                onClick={() =>
                                  deleteUser(user._id)
                                }
                                className="rounded-xl p-2 text-destructive hover:bg-destructive/5 transition"
                                title="Delete user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                            </div>

                          </td>

                        </tr>

                      ))}


                      {users.length === 0 && !loading && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-5 py-10 text-center text-sm text-muted-foreground"
                          >
                            No users found.
                          </td>
                        </tr>
                      )}

                    </tbody>

                  </table>

                </div>

              </section>


              {/* RECIPES */}

              <section className="mt-10">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                  <div className="flex items-center gap-3">

                    <ChefHat className="h-5 w-5 text-sage" />

                    <div>
                      <h2 className="font-display text-2xl">
                        Recipes
                      </h2>

                      <p className="text-sm text-muted-foreground">
                        Manage recipes stored in MongoDB.
                      </p>
                    </div>

                  </div>


                  <button
                    onClick={startCreateRecipe}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sage px-4 py-2.5 text-sm font-medium text-sage-foreground hover:opacity-90 transition"
                  >
                    <Plus className="h-4 w-4" />
                    Add Recipe
                  </button>

                </div>


                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                  {recipes.map((recipe) => (

                    <article
                      key={recipe._id}
                      className="rounded-3xl border border-border bg-card p-5"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <span className="text-3xl">
                          {recipe.emoji}
                        </span>

                        <span className="rounded-full bg-beige px-2.5 py-1 text-[11px]">
                          {recipe.difficulty}
                        </span>

                      </div>


                      <h3 className="mt-4 font-display text-lg">
                        {recipe.title}
                      </h3>


                      <p className="mt-1 text-xs text-muted-foreground">
                        {recipe.ingredients?.length || 0} ingredients
                        {" · "}
                        {recipe.prepTime} min
                      </p>


                      <div className="mt-4 flex gap-2">

                        <button
                          onClick={() =>
                            startEditRecipe(recipe)
                          }
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-border py-2 text-xs font-medium hover:border-sage transition"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>


                        <button
                          onClick={() =>
                            deleteRecipe(recipe._id)
                          }
                          className="rounded-xl border border-border px-3 text-destructive hover:bg-destructive/5 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                      </div>

                    </article>

                  ))}


                  {recipes.length === 0 && !loading && (
                    <p className="col-span-full rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                      No recipes found.
                    </p>
                  )}

                </div>

              </section>


              {/* ADMIN INFO */}

              <section className="mt-8 rounded-3xl border border-border bg-card p-6">

                <div className="flex gap-4">

                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sage-soft text-sage">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-display text-xl">
                      Administrator Access
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Administrative actions are protected by
                      backend authentication and authorization.
                    </p>
                  </div>

                </div>

              </section>

            </>
          )}


          {/* RECIPE FORM MODAL */}

          {showRecipeForm && (

            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5 backdrop-blur-sm">

              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-xl">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs uppercase tracking-widest text-sage">
                      Recipe Management
                    </p>

                    <h2 className="mt-1 font-display text-2xl">
                      {editingRecipe
                        ? "Edit Recipe"
                        : "Add Recipe"}
                    </h2>
                  </div>


                  <button
                    onClick={() =>
                      setShowRecipeForm(false)
                    }
                    className="rounded-xl p-2 hover:bg-beige transition"
                  >
                    <X className="h-5 w-5" />
                  </button>

                </div>


                <form
                  onSubmit={saveRecipe}
                  className="mt-6 space-y-4"
                >

                  <div className="grid grid-cols-[80px_1fr] gap-3">

                    <input
                      value={recipeForm.emoji}
                      onChange={(e) =>
                        setRecipeForm({
                          ...recipeForm,
                          emoji: e.target.value,
                        })
                      }
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-center text-xl outline-none focus:border-sage"
                      maxLength={4}
                    />


                    <input
                      value={recipeForm.title}
                      onChange={(e) =>
                        setRecipeForm({
                          ...recipeForm,
                          title: e.target.value,
                        })
                      }
                      placeholder="Recipe title"
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-sage"
                    />

                  </div>


                  <input
                    value={recipeForm.blurb}
                    onChange={(e) =>
                      setRecipeForm({
                        ...recipeForm,
                        blurb: e.target.value,
                      })
                    }
                    placeholder="Short description"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-sage"
                  />


                  <input
                    value={recipeForm.tags}
                    onChange={(e) =>
                      setRecipeForm({
                        ...recipeForm,
                        tags: e.target.value,
                      })
                    }
                    placeholder="Tags: Pasta, Quick, Vegetarian"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-sage"
                  />


                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Ingredients
                    </label>

                    <textarea
                      value={recipeForm.ingredients}
                      onChange={(e) =>
                        setRecipeForm({
                          ...recipeForm,
                          ingredients: e.target.value,
                        })
                      }
                      placeholder={"150g Pasta\n2 cloves Garlic\n100g Spinach"}
                      rows={6}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-sage"
                    />

                    <p className="mt-1 text-xs text-muted-foreground">
                      Put one ingredient on each line.
                    </p>

                  </div>


                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Instructions
                    </label>

                    <textarea
                      value={recipeForm.instructions}
                      onChange={(e) =>
                        setRecipeForm({
                          ...recipeForm,
                          instructions: e.target.value,
                        })
                      }
                      placeholder="Describe how to prepare the recipe..."
                      rows={5}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-sage"
                    />

                  </div>


                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                    <input
                      type="number"
                      value={recipeForm.prepTime}
                      onChange={(e) =>
                        setRecipeForm({
                          ...recipeForm,
                          prepTime: e.target.value,
                        })
                      }
                      placeholder="Minutes"
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-sage"
                    />


                    <input
                      type="number"
                      value={recipeForm.calories}
                      onChange={(e) =>
                        setRecipeForm({
                          ...recipeForm,
                          calories: e.target.value,
                        })
                      }
                      placeholder="Calories"
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-sage"
                    />


                    <select
                      value={recipeForm.difficulty}
                      onChange={(e) =>
                        setRecipeForm({
                          ...recipeForm,
                          difficulty: e.target.value,
                        })
                      }
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-sage"
                    >
                      <option value="Easy">
                        Easy
                      </option>

                      <option value="Medium">
                        Medium
                      </option>

                      <option value="Hard">
                        Hard
                      </option>
                    </select>

                  </div>


                  <div className="flex gap-3 pt-3">

                    <button
                      type="button"
                      onClick={() =>
                        setShowRecipeForm(false)
                      }
                      className="flex-1 rounded-2xl border border-border py-3 text-sm font-medium hover:bg-beige transition"
                    >
                      Cancel
                    </button>


                    <button
                      type="submit"
                      disabled={savingRecipe}
                      className="flex-1 rounded-2xl bg-sage py-3 text-sm font-medium text-sage-foreground hover:opacity-90 disabled:opacity-50 transition"
                    >
                      {savingRecipe
                        ? "Saving..."
                        : editingRecipe
                        ? "Save Changes"
                        : "Create Recipe"}
                    </button>

                  </div>

                </form>

              </div>

            </div>

          )}

        </main>

      </div>
    </div>
  );
}