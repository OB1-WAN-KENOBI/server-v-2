const http = require("http");

const BASE_URL = "http://localhost:3000";

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(url, options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPI() {
  console.log("🧪 Testing API endpoints...\n");

  try {
    // Test 1: GET projects
    console.log("1. GET /api/projects");
    const projects = await makeRequest("GET", "/api/projects");
    console.log(`   Status: ${projects.status}`);
    console.log(
      `   Projects count: ${
        Array.isArray(projects.body) ? projects.body.length : "N/A"
      }\n`
    );

    // Test 2: POST project
    console.log("2. POST /api/projects (create new)");
    const newProject = {
      title: { ru: "Test Project", en: "Test Project" },
      description: { ru: "Test description", en: "Test description" },
      techStack: ["React", "TypeScript"],
      year: 2024,
      status: "In Progress",
    };
    const created = await makeRequest("POST", "/api/projects", newProject);
    console.log(`   Status: ${created.status}`);
    console.log(`   Created project ID: ${created.body?.id || "N/A"}\n`);

    // Test 3: GET projects again (should have one more)
    console.log("3. GET /api/projects (verify creation)");
    const projectsAfter = await makeRequest("GET", "/api/projects");
    console.log(`   Status: ${projectsAfter.status}`);
    console.log(
      `   Projects count: ${
        Array.isArray(projectsAfter.body) ? projectsAfter.body.length : "N/A"
      }\n`
    );

    // Test 4: PATCH project
    if (created.body?.id) {
      console.log(`4. PATCH /api/projects/${created.body.id} (update)`);
      const updated = await makeRequest(
        "PATCH",
        `/api/projects/${created.body.id}`,
        {
          status: "Completed",
        }
      );
      console.log(`   Status: ${updated.status}`);
      console.log(`   Updated status: ${updated.body?.status || "N/A"}\n`);
    }

    // Test 5: GET profile
    console.log("5. GET /api/profile");
    const profile = await makeRequest("GET", "/api/profile");
    console.log(`   Status: ${profile.status}`);
    console.log(`   Profile name: ${profile.body?.name || "N/A"}\n`);

    // Test 6: PATCH profile
    console.log("6. PATCH /api/profile (update)");
    const updatedProfile = await makeRequest("PATCH", "/api/profile", {
      name: "Test User",
    });
    console.log(`   Status: ${updatedProfile.status}`);
    console.log(`   Updated name: ${updatedProfile.body?.name || "N/A"}\n`);

    // Test 7: GET skills
    console.log("7. GET /api/skills");
    const skills = await makeRequest("GET", "/api/skills");
    console.log(`   Status: ${skills.status}`);
    console.log(
      `   Skills count: ${
        Array.isArray(skills.body) ? skills.body.length : "N/A"
      }\n`
    );

    // Test 8: POST skill
    console.log("8. POST /api/skills (create new)");
    const newSkill = await makeRequest("POST", "/api/skills", {
      name: "Test Skill",
      category: "other",
      level: "middle",
    });
    console.log(`   Status: ${newSkill.status}`);
    console.log(`   Created skill: ${newSkill.body?.name || "N/A"}\n`);

    // Test 9: GET skills again
    console.log("9. GET /api/skills (verify creation)");
    const skillsAfter = await makeRequest("GET", "/api/skills");
    console.log(`   Status: ${skillsAfter.status}`);
    console.log(
      `   Skills count: ${
        Array.isArray(skillsAfter.body) ? skillsAfter.body.length : "N/A"
      }\n`
    );

    console.log("✅ All tests completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("   Make sure the server is running on port 3000");
  }
}

testAPI();
