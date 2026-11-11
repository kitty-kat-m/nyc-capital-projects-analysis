# Working together on the report

## Read and comment

Open the published report from the README. To suggest a change, open a GitHub Issue using the Report feedback template. Give the tab, graph title, proposed change, and any supporting source. A screenshot is helpful. Teammates can reply in the issue.

The published webpage is for viewing. Comments and editing happen in this repository, not directly on the webpage.

## Make and review an edit

Repository collaborators with write access can use GitHub Desktop to fetch/pull the latest version, create a branch, and edit `docs/index.html` locally. Open it in a browser to review the result. Commit the change, push the branch, and open a pull request. Teammates can discuss and review the changes before it is merged.

The HTML is a large generated report. Agree who is editing it at a given time; separate feedback issues make coordination easier. Keep the input dataset and calculation definitions consistent when rebuilding a graph.

## Publish the latest version

GitHub Pages publishes the `docs` folder on `main`. Merging an approved report update to `main` triggers a new build. The website link stays the same. Check the Pages build and refresh the published report before sharing an update.

## Give teammates access

The repository owner can use Settings â†’ Collaborators â†’ Add people. Invite each teammate using their GitHub username. Public visitors can read the report; an invitation is needed to give someone direct write access. No invitations are sent automatically by this setup.

## Protect personal information

Do not commit personal names, email addresses, local computer paths, private source documents, modelling audit ZIPs or detailed source exports. Use a GitHub no-reply address for commits. Keep necessary public-data provenance in the report without adding personal contact details.

After the 10 November 2026 privacy cleanup, re-clone before editing. Do not push old branches back into the refreshed history.
