// backend/resume-templates.js

function getClassicTemplateHTML(data) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resume - ${data.personalDetails.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; color: #333; font-size: 10pt; }
        .container { width: 800px; margin: 20px auto; background-color: #fff; padding: 30px; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
        h1, h2, h3 { margin: 0; padding: 0; }
        h1 { font-size: 22pt; text-align: center; margin-bottom: 5px; }
        .contact-info { text-align: center; font-size: 9pt; margin-bottom: 15px; color: #555; }
        .contact-info a { color: #0066cc; text-decoration: none; }
        .contact-info a:hover { text-decoration: underline; }
        hr { border: 0; height: 1px; background-color: #ccc; margin: 20px 0; }
        .section { margin-bottom: 15px; }
        .section h2 { font-size: 12pt; text-transform: uppercase; border-bottom: 2px solid #333; margin-bottom: 8px; padding-bottom: 3px; }
        .section p, .section ul { margin: 0 0 5px 0; padding: 0; line-height: 1.4; }
        .section ul { list-style: disc; padding-left: 20px; }
        .job { margin-bottom: 10px; }
        .job h3 { font-size: 10pt; font-weight: bold; }
        .job .company { font-weight: normal; }
        .job .dates { font-size: 9pt; font-style: italic; color: #666; margin-bottom: 3px; }
        .job .description { font-size: 9.5pt; white-space: pre-line; }
        .skills-list { padding-left: 0; list-style: none; }
        .skills-list li { display: inline-block; background-color: #eee; padding: 3px 8px; margin-right: 5px; margin-bottom: 5px; border-radius: 3px; font-size: 9pt;}
        .summary { font-size: 10pt; line-height: 1.5; margin-bottom: 20px; text-align: justify; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${data.personalDetails.name}</h1>
        <p class="contact-info">
          ${data.personalDetails.email} | ${data.personalDetails.phone}
          ${
            data.personalDetails.linkedin
              ? ` | <a href="${data.personalDetails.linkedin}" target="_blank">LinkedIn</a>`
              : ""
          }
          ${
            data.personalDetails.portfolio
              ? ` | <a href="${data.personalDetails.portfolio}" target="_blank">Portfolio</a>`
              : ""
          }
        </p>
        <hr>

        ${
          data.summary
            ? `
        <div class="section">
          <h2>Professional Summary</h2>
          <p class="summary">${data.summary}</p>
        </div>`
            : ""
        }

        ${
          data.commonSkills && data.commonSkills.length > 0
            ? `
        <div class="section">
          <h2>Skills</h2>
          <ul class="skills-list">
            ${data.commonSkills.map((skill) => `<li>${skill}</li>`).join("")}
          </ul>
        </div>`
            : ""
        }

        ${
          data.workHistory && data.workHistory.length > 0
            ? `
        <div class="section">
          <h2>Work Experience</h2>
          ${data.workHistory
            .map(
              (job) => `
            <div class="job">
              <h3>${job.title} <span class="company">at ${job.company}</span></h3>
              <p class="dates">${job.startDate} - ${job.endDate}</p>
              <p class="description">${job.description}</p>
            </div>
          `
            )
            .join("")}
        </div>`
            : ""
        }

        ${
          data.commonAchievements && data.commonAchievements.length > 0
            ? `
        <div class="section">
          <h2>Achievements</h2>
          <ul>
            ${data.commonAchievements.map((ach) => `<li>${ach}</li>`).join("")}
          </ul>
        </div>`
            : ""
        }

      </div>
    </body>
    </html>
  `;
}

function getModernTemplateHTML(data) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resume - Modern - ${data.personalDetails.name}</title>
      <style>
        /* TODO: Add styles for Modern template */
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; font-size: 11pt; }
        .container { width: 800px; margin: 25px auto; background-color: #fff; padding: 35px; box-shadow: 0 2px 15px rgba(0,0,0,0.1); border-radius: 8px; }
        h1 { font-size: 24pt; text-align: left; margin-bottom: 8px; color: #2c3e50; }
        .contact-info { text-align: left; font-size: 10pt; margin-bottom: 20px; color: #555; }
        .contact-info a { color: #3498db; text-decoration: none; }
        .contact-info a:hover { text-decoration: underline; }
        hr { border: 0; height: 1px; background-color: #e0e0e0; margin: 25px 0; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 14pt; text-transform: uppercase; color: #3498db; border-bottom: 2px solid #3498db; margin-bottom: 10px; padding-bottom: 5px; }
        .section p, .section ul { margin: 0 0 8px 0; padding: 0; line-height: 1.5; }
        .section ul { list-style: none; padding-left: 0; }
        .section ul li::before { content: "▪"; margin-right: 10px; color: #3498db; }
        .job { margin-bottom: 15px; padding-left: 15px; border-left: 3px solid #ecf0f1; }
        .job h3 { font-size: 11pt; font-weight: bold; color: #333; }
        .job .company { font-weight: normal; color: #555; }
        .job .dates { font-size: 9.5pt; font-style: italic; color: #777; margin-bottom: 5px; }
        .job .description { font-size: 10pt; white-space: pre-line; }
        .skills-list { padding-left: 0; list-style: none; text-align: left; }
        .skills-list li { display: inline-block; background-color: #3498db; color: white; padding: 5px 12px; margin-right: 8px; margin-bottom: 8px; border-radius: 4px; font-size: 9.5pt;}
        .summary { font-size: 10.5pt; line-height: 1.6; color: #444; text-align: justify; margin-bottom: 25px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${data.personalDetails.name}</h1>
        <p class="contact-info">
          ${data.personalDetails.email} | ${data.personalDetails.phone}
          ${
            data.personalDetails.linkedin
              ? ` | <a href="${data.personalDetails.linkedin}" target="_blank">LinkedIn</a>`
              : ""
          }
          ${
            data.personalDetails.portfolio
              ? ` | <a href="${data.personalDetails.portfolio}" target="_blank">Portfolio</a>`
              : ""
          }
        </p>
        <hr>

        ${
          data.summary
            ? `
        <div class="section">
          <h2>Professional Summary</h2>
          <p class="summary">${data.summary}</p>
        </div>`
            : ""
        }

        ${
          data.commonSkills && data.commonSkills.length > 0
            ? `
        <div class="section">
          <h2>Skills</h2>
          <ul class="skills-list">
            ${data.commonSkills.map((skill) => `<li>${skill}</li>`).join("")}
          </ul>
        </div>`
            : ""
        }

        ${
          data.workHistory && data.workHistory.length > 0
            ? `
        <div class="section">
          <h2>Work Experience</h2>
          ${data.workHistory
            .map(
              (job) => `
            <div class="job">
              <h3>${job.title} <span class="company">at ${job.company}</span></h3>
              <p class="dates">${job.startDate} - ${job.endDate}</p>
              <p class="description">${job.description}</p>
            </div>
          `
            )
            .join("")}
        </div>`
            : ""
        }

        ${
          data.commonAchievements && data.commonAchievements.length > 0
            ? `
        <div class="section">
          <h2>Achievements</h2>
          <ul>
            ${data.commonAchievements.map((ach) => `<li>${ach}</li>`).join("")}
          </ul>
        </div>`
            : ""
        }

      </div>
    </body>
    </html>
  `;
}

function getCreativeTemplateHTML(data) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resume - Creative - ${data.personalDetails.name}</title>
      <style>
        /* TODO: Add styles for Creative template */
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans:wght@400;600&display=swap');
        body { font-family: 'Open Sans', sans-serif; margin: 0; padding: 0; background-color: #e9e9e9; color: #444; font-size: 10.5pt; line-height: 1.6; }
        .container { max-width: 850px; margin: 30px auto; background: linear-gradient(135deg, #ffffff 0%, #f7f7f7 100%); padding: 40px; border-radius: 10px; box-shadow: 0 5px 25px rgba(0,0,0,0.15); display: flex; }
        .sidebar { width: 35%; background-color: #3A4750; color: #fff; padding: 30px; border-top-left-radius: 10px; border-bottom-left-radius: 10px; text-align: center; }
        .main-content { width: 65%; padding: 30px; padding-left: 40px; }
        .profile-pic { width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 15px auto; border: 4px solid #F6C90E; object-fit: cover; }
        .sidebar h1 { font-family: 'Montserrat', sans-serif; font-size: 20pt; margin-bottom: 5px; color: #F6C90E; }
        .sidebar .contact-info { font-size: 9pt; margin-bottom: 20px; }
        .sidebar .contact-info p { margin: 5px 0; }
        .sidebar .contact-info a { color: #fff; text-decoration: none; }
        .sidebar .contact-info a:hover { text-decoration: underline; }
        .sidebar .section h2 { font-family: 'Montserrat', sans-serif; font-size: 12pt; text-transform: uppercase; color: #F6C90E; margin-top: 25px; margin-bottom: 8px; border-bottom: 1px solid #F6C90E; padding-bottom: 4px; }
        .sidebar .skills-list { list-style: none; padding: 0; text-align: left; }
        .sidebar .skills-list li { background-color: #F6C90E; color: #3A4750; padding: 4px 10px; margin-bottom: 6px; border-radius: 3px; font-size: 9pt; font-weight: 600;}

        .main-content h2 { font-family: 'Montserrat', sans-serif; font-size: 16pt; text-transform: uppercase; color: #3A4750; border-bottom: 3px solid #F6C90E; margin-bottom: 15px; padding-bottom: 6px; }
        .main-content .section p, .main-content .section ul { margin: 0 0 10px 0; padding: 0; }
        .main-content .section ul { list-style: none; padding-left: 0; }
        .main-content .section ul li { position: relative; padding-left: 25px; margin-bottom: 8px; }
        .main-content .section ul li::before { content: "▹"; position: absolute; left: 0; color: #F6C90E; font-weight: bold; font-size: 14pt; line-height: 1; }
        .job { margin-bottom: 20px; }
        .job h3 { font-family: 'Montserrat', sans-serif; font-size: 12pt; font-weight: 700; color: #3A4750; }
        .job .company { font-weight: 600; color: #555; }
        .job .dates { font-size: 9pt; font-style: italic; color: #777; margin-bottom: 5px; }
        .job .description { font-size: 10pt; white-space: pre-line; }
        .summary { font-size: 10.5pt; line-height: 1.6; text-align: justify; margin-bottom: 25px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="sidebar">
          ${
            data.personalDetails.profilePicture
              ? `<img src="${data.personalDetails.profilePicture}" alt="Profile" class="profile-pic">`
              : ""
          }
          <h1>${data.personalDetails.name}</h1>
          <div class="contact-info">
            <p>${data.personalDetails.email}</p>
            <p>${data.personalDetails.phone}</p>
            ${
              data.personalDetails.linkedin
                ? `<p><a href="${data.personalDetails.linkedin}" target="_blank">LinkedIn</a></p>`
                : ""
            }
            ${
              data.personalDetails.portfolio
                ? `<p><a href="${data.personalDetails.portfolio}" target="_blank">Portfolio</a></p>`
                : ""
            }
          </div>
          ${
            data.commonSkills && data.commonSkills.length > 0
              ? `
          <div class="section">
            <h2>Skills</h2>
            <ul class="skills-list">
              ${data.commonSkills.map((skill) => `<li>${skill}</li>`).join("")}
            </ul>
          </div>`
              : ""
          }
        </div>
        <div class="main-content">
          ${
            data.summary
              ? `
          <div class="section">
            <h2>Professional Summary</h2>
            <p class="summary">${data.summary}</p>
          </div>`
              : ""
          }

          ${
            data.workHistory && data.workHistory.length > 0
              ? `
          <div class="section">
            <h2>Work Experience</h2>
            ${data.workHistory
              .map(
                (job) => `
              <div class="job">
                <h3>${job.title} <span class="company">at ${job.company}</span></h3>
                <p class="dates">${job.startDate} - ${job.endDate}</p>
                <p class="description">${job.description}</p>
              </div>
            `
              )
              .join("")}
          </div>`
              : ""
          }

          ${
            data.commonAchievements && data.commonAchievements.length > 0
              ? `
          <div class="section">
            <h2>Achievements</h2>
            <ul>
              ${data.commonAchievements
                .map((ach) => `<li>${ach}</li>`)
                .join("")}
            </ul>
          </div>`
              : ""
          }
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  getClassicTemplateHTML,
  getModernTemplateHTML,
  getCreativeTemplateHTML,
};
