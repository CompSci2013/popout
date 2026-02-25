# GitLab API Handbook

This guide provides a sequence of `cURL` commands to manage GitLab resources using the REST API. 

**Authentication**: All commands assume a Personal Access Token `PA-TOKEN` is used in the `PRIVATE-TOKEN` header.
**Base URL**: The commands use `http://gitlab.minilab` as the base URL.

---

### 1. Discover Your User ID
Before managing permissions, you often need your own internal GitLab ID.

**Command:**
```bash
curl --header "PRIVATE-TOKEN: PA-TOKEN" "http://gitlab.minilab/api/v4/user"
```

**How it works:**
*   `GET /user`: Returns the authenticated user's profile.
*   **Key Field**: Look for `"id": 123` in the JSON response.

---

### 2. Discover the ID of a Named Group
Search for a group by its name or path to find its unique numeric ID.

**Command:**
```bash
curl --header "PRIVATE-TOKEN: PA-TOKEN" "http://gitlab.minilab/api/v4/groups?search=my-awesome-group"
```

**How it works:**
*   `GET /groups`: Lists groups.
*   `?search=...`: Filters results by name or path.
*   **Result**: An array of groups. Identify the correct one and note its `"id"`.

---

### 3. Create a New Group
Create a top-level namespace for your projects.

**Command:**
```bash
curl --request POST --header "PRIVATE-TOKEN: PA-TOKEN" 
     --header "Content-Type: application/json" 
     --data '{"name": "New Team", "path": "new-team", "visibility": "private"}' 
     "http://gitlab.minilab/api/v4/groups"
```

**How it works:**
*   `POST /groups`: Creates a new group.
*   `name`: The human-readable name.
*   `path`: The URL-friendly slug.
*   `visibility`: Can be `private`, `internal`, or `public`.

---

### 4. Create a New Project in a Group
Create a repository inside a specific group using the group's ID.

**Command:**
```bash
curl --request POST --header "PRIVATE-TOKEN: PA-TOKEN" 
     --header "Content-Type: application/json" 
     --data '{"name": "My Project", "namespace_id": 456, "visibility": "private"}' 
     "http://gitlab.minilab/api/v4/projects"
```

**How it works:**
*   `POST /projects`: Creates a project.
*   `namespace_id`: The ID of the group where the project should live.
*   **Result**: The response will contain the project's `"id"`.

---

### 5. Discover the ID of a Project
If you know the project's path (e.g., `group/project-name`), you can fetch its details directly.

**Command:**
```bash
curl --header "PRIVATE-TOKEN: PA-TOKEN" "http://gitlab.minilab/api/v4/projects/group%2Fproject-name"
```

**How it works:**
*   `GET /projects/:id`: Here, `:id` is the **URL-encoded** path of the project. 
*   `%2F`: The URL-encoded forward slash (`/`).
*   **Key Field**: Note the `"id": 789`.

---

### 6. Assign a User to a Group (Membership)
Grant a user access to a group. This also gives them "visibility" of the group resources.

**Command:**
```bash
curl --request POST --header "PRIVATE-TOKEN: PA-TOKEN" 
     --data "user_id=123&access_level=30" 
     "http://gitlab.minilab/api/v4/groups/456/members"
```

**How it works:**
*   `POST /groups/:id/members`: Adds a member to a group.
*   `user_id`: The ID of the user being added.
*   `access_level`: Numeric code for permissions. 
    *   `10`: Guest
    *   `20`: Reporter
    *   `30`: Developer
    *   `40`: Maintainer
    *   `50`: Owner

---

### 7. Move a Project (Repository) to Another Group
Transfer a repository from its current location to a new group namespace.

**Command:**
```bash
curl --request POST --header "PRIVATE-TOKEN: PA-TOKEN" 
     "http://gitlab.minilab/api/v4/projects/789/transfer?namespace=999"
```

**How it works:**
*   `POST /projects/:id/transfer`: Moves the project.
*   `namespace`: The ID of the **target group** (the new parent).
*   **Requirement**: You must have Owner/Maintainer permissions in both the project and the target group.

---

### 8. List All Groups You Belong To
A quick way to audit your access.

**Command:**
```bash
curl --header "PRIVATE-TOKEN: PA-TOKEN" "http://gitlab.minilab/api/v4/groups?min_access_level=30"
```

**How it works:**
*   `?min_access_level=30`: Only shows groups where you have at least 'Developer' access.

---

### 9. Delete a Project
Use with caution. This removes the repository and all associated data.

**Command:**
```bash
curl --request DELETE --header "PRIVATE-TOKEN: PA-TOKEN" "http://gitlab.minilab/api/v4/projects/789"
```

**How it works:**
*   `DELETE /projects/:id`: Marks a project for deletion. Depending on GitLab settings, this may be immediate or scheduled for delayed deletion.

---

# Milestones, Epics, and Issues

Manage your project roadmap and task tracking via the API.

## 1. Create a Project Milestone
Milestones are used to track issues and merge requests for a specific period.

**Command:**
```bash
curl --request POST --header "PRIVATE-TOKEN: PA-TOKEN" 
     --data "title=Release v1.0&description=Initial stable release" 
     "http://gitlab.minilab/api/v4/projects/789/milestones"
```

**How it works:**
*   `POST /projects/:id/milestones`: Creates a milestone for a specific project.
*   **Result**: Returns the `"id"` (numeric) and `"iid"` (internal ID, usually 1, 2, 3...) of the milestone.

## 2. Create a Group Epic (Premium/Ultimate only)
Epics allow you to manage a portfolio of projects more efficiently by tracking groups of issues.

**Command:**
```bash
curl --request POST --header "PRIVATE-TOKEN: PA-TOKEN" 
     --data "title=Major Refactor&description=Core architectural changes" 
     "http://gitlab.minilab/api/v4/groups/456/epics"
```

**How it works:**
*   `POST /groups/:id/epics`: Creates an epic at the group level.
*   **Note**: Epics are a GitLab Premium feature. If you are on the Free/Community edition, this will return 403 or 404.

## 3. Create a Project Issue
Create a task or bug report within a project.

**Command:**
```bash
curl --request POST --header "PRIVATE-TOKEN: PA-TOKEN" 
     --header "Content-Type: application/json" 
     --data '{
       "title": "Fix login bug",
       "description": "User cannot login with valid credentials",
       "labels": "bug,critical",
       "assignee_ids": [123]
     }' 
     "http://gitlab.minilab/api/v4/projects/789/issues"
```

**How it works:**
*   `POST /projects/:id/issues`: Creates a new issue.
*   `assignee_ids`: An array of user IDs to assign the issue to.
*   **Result**: Returns the issue `"id"` and `"iid"`.

## 4. Link an Issue to a Milestone
Update an existing issue to associate it with a specific milestone.

**Command:**
```bash
curl --request PUT --header "PRIVATE-TOKEN: PA-TOKEN" 
     --data "milestone_id=101" 
     "http://gitlab.minilab/api/v4/projects/789/issues/5"
```

**How it works:**
*   `PUT /projects/:id/issues/:issue_iid`: Updates the issue.
*   Note: Use the **issue_iid** (e.g., 5) in the URL, but the **milestone_id** (global numeric ID, e.g., 101) in the data.

## 5. Add an Issue to an Epic
Link a project issue to a group-level epic.

**Command:**
```bash
curl --request POST --header "PRIVATE-TOKEN: PA-TOKEN" 
     "http://gitlab.minilab/api/v4/groups/456/epics/12/issues/12345"
```

**How it works:**
*   `POST /groups/:id/epics/:epic_iid/issues/:issue_id`: Links an existing issue to an epic.
*   `:epic_iid`: The internal ID of the epic.
*   `:issue_id`: The **global numeric ID** of the issue (not the IID).

---

# How to Publish an Angular Library to GitLab's npm Registry

GitLab (Community Edition 13.x+) includes a built-in npm package registry. No extra infrastructure needed.

## Prerequisites

- A GitLab project with `packages_enabled: true` (default for new projects)
- A GitLab Personal Access Token with `api` scope
- An Angular library already built (see `01-convert-component-to-library.md`)

## Step 1: Verify the Package Registry is Available

```bash
# Check your GitLab version
curl -s -H "PRIVATE-TOKEN: <your-token>" "http://gitlab.minilab/api/v4/version"

# Check packages are enabled on a project
curl -s -H "PRIVATE-TOKEN: <your-token>" 
  "http://gitlab.minilab/api/v4/projects/<PROJECT_ID>" 
  | python3 -c "import sys,json; print(json.load(sys.stdin)['packages_enabled'])"
```

If `packages_enabled` is `false`, enable it in Project Settings > General > Visibility > Package Registry.

## Step 2: Create a GitLab Project (if needed)

If you don't already have a GitLab project for this package:

```bash
curl -s -X POST 
  -H "PRIVATE-TOKEN: <your-token>" 
  -H "Content-Type: application/json" 
  "http://gitlab.minilab/api/v4/projects" 
  -d '{
    "name": "ngx-time-range-slider",
    "namespace_id": 7,
    "description": "Angular time range slider component",
    "visibility": "internal",
    "packages_enabled": true
  }'
```

Note the `id` from the response — you'll need it for the registry URL.

For this project: **ID 93**, path `halo/ngx-time-range-slider`.

## Step 3: Configure npm Authentication

Create `.npmrc` in your library's source directory (`projects/time-range-slider/.npmrc`):

```
@halolabs:registry=http://gitlab.minilab/api/v4/projects/93/packages/npm/
//gitlab.minilab/api/v4/projects/93/packages/npm/:_authToken=<your-gitlab-token>
```

**Important:** Add this file to `.gitignore` — it contains your auth token.

```bash
echo "projects/time-range-slider/.npmrc" >> .gitignore
```

## Step 4: Build the Library

```bash
ng build time-range-slider
```

This produces the publishable package in `dist/time-range-slider/`.

## Step 5: Publish

Copy the `.npmrc` into the dist directory and publish:

```bash
cp projects/time-range-slider/.npmrc dist/time-range-slider/
cd dist/time-range-slider
npm publish
```

You should see:
```
+ @halolabs/ngx-time-range-slider@1.0.0
```

## Step 6: Verify on GitLab

Navigate to your GitLab project > Packages & Registries > Package Registry. You should see the published package listed there.

Or via API:
```bash
curl -s -H "PRIVATE-TOKEN: <your-token>" 
  "http://gitlab.minilab/api/v4/projects/93/packages" 
  | python3 -m json.tool
```

## Publishing Updates

To publish a new version:

1. Update the version in `projects/time-range-slider/package.json`
2. Rebuild: `ng build time-range-slider`
3. Copy `.npmrc` and publish: `cp projects/time-range-slider/.npmrc dist/time-range-slider/ && cd dist/time-range-slider && npm publish`

npm will reject duplicate versions — always increment before publishing.

## Registry URL Reference

| Scope | URL |
|-------|-----|
| Project-level | `http://gitlab.minilab/api/v4/projects/<ID>/packages/npm/` |
| Group-level (read) | `http://gitlab.minilab/api/v4/groups/<ID>/-/packages/npm/` |

Group-level URLs let consumers install any package from the group with a single registry entry.
