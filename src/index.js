const Path = require("path");
const rimraf = require("rimraf");
const Lib = require("./util.js");
const github = require("octonode");

// Info variable declaration
// #region Info variable declaration
const GithubUsername = process.env.GITHUB_USERNAME || "";
const GithubKey = process.env.GITHUB_KEY || "";
const TargetRepository =
  process.env.GITHUB_REPOSITORY || "wuttinanhi/test-compose";
const TargetBranch = process.env.GITHUB_BRANCH || "test";
const TargetDirectory = Path.resolve(process.env.DEPLOY_DIRECTORY || "repo");
const RefreshRate = parseInt(process.env.REFRESH_RATE) || 15000;
const DebugMode = Boolean(process.env.DEBUG_MODE);
// #endregion Info variable declaration

// Internal variable declaration
// #region Internal variable declaration
let CurrentSHA = "NULL";
let IsCloning = false;
const ShouldLoop = true;
// #endregion Internal variable declaration

// Make repository url looks good
// #region Make repository url looks good
let RepositoryUrl;
if (GithubKey === "" || GithubKey === null) {
  RepositoryUrl = "https://github.com/";
} else {
  RepositoryUrl =
    "https://" + GithubUsername + ":" + GithubKey + "@github.com/";
}
RepositoryUrl = RepositoryUrl + TargetRepository;
console.log(RepositoryUrl);
// #endregion Make repository url looks good

// Create Octonode Github client
// #region Create Octonode Github client
const OctonodeClient = github.client({
  username: GithubUsername,
  password: GithubKey,
});
const OctonodeRepo = OctonodeClient.repo(TargetRepository);
// #endregion Create Octonode Github client

// Function wrapper
// #region Function wrapper

/**
 * Function get last commit SHA
 * @param  {Object} OctonodeRepoInstance OctonodeRepo Instance
 * @param  {String} Branch Branch name
 * @return {Promise} Resolve latest commit sha
 */
function GetLastCommitSha(OctonodeRepoInstance, Branch) {
  return new Promise((resolve, reject) => {
    OctonodeRepoInstance.branch(Branch, (Error, Branchdata) => {
      if (Error) {
        return reject(Error);
      }
      return resolve(Branchdata.commit.sha);
    });
  });
}

/**
 * Function clone repository
 * @param  {String} TargetRepo Target repository url (full)
 * @param  {String} Branch Branch name
 * @param  {String} Destination Destination directory to clone
 * @return {Promise} Return resolve(true) if successfully clone
 */
async function CloneRepo(TargetRepo, Branch, Destination, DeleteFirst = false) {
  // Check cloning in work
  if (IsCloning === true) {
    return Promise.resolve(false);
  }

  // set IsCloning to true
  IsCloning = true;

  // Clone destination folder
  const CloneDestination = Path.resolve(Destination);

  // Deprecated
  if (DeleteFirst === true) {
    rimraf.sync(CloneDestination);
  }

  try {
    // Command to clone Github
    const Commandline =
      "git clone --branch=" + Branch + " " + TargetRepo + " " + Destination;

    // Execute the command
    await Lib.ShellJsExecute(Commandline, TargetDirectory);

    // Wait to finalize
    await Lib.Wait(1000);

    // set IsCloning to false
    IsCloning = false;

    // return promise resolve(true)
    return Promise.resolve(true);
  } catch (error) {
    // Something error when execute
    console.log("Error cloning");

    return Promise.reject(error);
  } finally {
    // set IsCloning to false
    IsCloning = false;
  }
}

/**
 * Log text with pretty date
 * @param  {String} Text Text to log
 */
function Log(Text) {
  console.log("[" + Lib.GenerateDate() + "] " + Text);
}

// #endregion Function wrapper

// Main function declaration
// #region Main function declaration
async function main() {
  // Tell where to listening
  Log("Listening to " + TargetRepository + " Branch: " + TargetBranch);

  // Create repository directory
  await Lib.CreateDirectory(TargetDirectory);

  // Check Loop
  while (true) {
    try {
      // Get new commit SHA
      const NewSHA = await GetLastCommitSha(OctonodeRepo, TargetBranch);

      // Check if New commit SHA is different from current commit SHA
      // If different (!==) new commit is being pushed
      // If not different (===) nothing change

      if (NewSHA !== CurrentSHA) {
        // Log new commit detected
        Log(
          "New commit detected. New SHA: " +
            NewSHA.substring(0, 5) +
            " Old SHA: " +
            CurrentSHA.substring(0, 5)
        );

        // Target directory for clone to
        const DestinationDirectory = Path.resolve(
          TargetDirectory,
          "repo-" + TargetBranch + "-" + NewSHA
        );

        // Perform clone new commit
        // #region Perform clone new commit

        // Check Directory Exists
        const TargetCommitDirectory = await Lib.CheckDirectoryExists(
          DestinationDirectory
        );

        if (TargetCommitDirectory === true) {
          // No clone because directory exists
          Log("No clone because directory exists.");
        } else {
          // Start cloning
          await CloneRepo(RepositoryUrl, TargetBranch, DestinationDirectory);
          Log("Clone complete.");
        }

        // #endregion Perform clone new commit

        // Check if repository have entry file
        // #region Check if repository have an entry file

        // Entry file path
        const EntryFile = Path.join(DestinationDirectory, "deploy-entry.sh");

        // Check entry file exists in cloned directory
        const CheckEntryFileExists = await Lib.CheckFileExists(EntryFile);

        if (CheckEntryFileExists === true) {
          // Found entry file
          Log("Found entry file. executing...");
          Log("Execute directory: " + DestinationDirectory);

          // Change permission of entry file
          Lib.ShellJsChmod(770, EntryFile);

          // Start execute the entry file
          await Lib.ShellJsExecute(EntryFile, DestinationDirectory);

          // Log execute is complete
          Log("Execute completed.");
        } else {
          // No entry file found
          Log("No entry file found.");
        }
        // #endregion region Check if repository have an entry file

        // Update current SHA to New SHA
        CurrentSHA = NewSHA;
      } else {
        // No new commit found
        // Log("No new commit found. " + CurrentSHA.substring(0, 5));
      }

      // Check should continue loop
      if (ShouldLoop === false) {
        break;
      }
    } catch (error) {
      // Somethig error
      Log("Something error.");

      if (DebugMode === true) {
        console.log(error);
      }
    }

    // Wait
    await Lib.Wait(RefreshRate);
  }
}
// #endregion Main function declaration

// Execute main function
main();
