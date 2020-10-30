const Path = require("path");
const rimraf = require("rimraf");
const Lib = require("./lib");
var github = require("octonode");

// Info Variable
// #region info_variable
const GithubUsername = process.env.GITHUB_USERNAME || "";
const GithubKey = process.env.GITHUB_KEY || "";
const TargetRepository =
  process.env.GITHUB_REPOSITORY || "wuttinanhi/test-compose";
const TargetBranch = process.env.GITHUB_BRANCH || "test";
const TargetDirectory = Path.resolve(process.env.DEPLOY_DIRECTORY || "repo");
const RefreshRate = parseInt(process.env.REFRESH_RATE) || 15000;
const DebugMode = Boolean(process.env.DEBUG_MODE);
// #endregion info_variable

// Internal Variable
// #region internal_variable
var CheckSha = "NULL";
var IsCloning = false;
var ShouldLoop = true;
// #endregion internal_variable

// Make repository url looks good
// #region make_repo_url
var RepositoryUrl;
if (GithubKey === "" || GithubKey === null) {
  RepositoryUrl = "https://github.com/";
} else {
  RepositoryUrl =
    "https://" + GithubUsername + ":" + GithubKey + "@github.com/";
}
RepositoryUrl = RepositoryUrl + TargetRepository;
// #endregion makerepourl

// Create Octonode Github client
// #region github_client
var OctonodeClient = github.client({
  username: GithubUsername,
  password: GithubKey,
});
var OctonodeRepo = OctonodeClient.repo(TargetRepository);
// #endregion github_client

// Function wrapper
// #region function_wrapper

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
  var CloneDestination = Path.resolve(Destination);

  // Deprecated
  if (DeleteFirst === true) {
    rimraf.sync(CloneDestination);
  }

  try {
    // Command to clone Github
    var Commandline =
      "git clone --branch=" + Branch + " " + TargetRepo + " " + Destination;

    // Execute
    await Lib.ShellJsExecute(Commandline, TargetDirectory);

    // Wait to finalize
    await Lib.Wait(1000);

    // set IsCloning to false
    IsCloning = false;

    // return promise resolve(true)
    return Promise.resolve(true);
  } catch (e) {
    // Something error when execute
    console.log("Error cloning");

    // return promise resolve(error)
    return Promise.reject(new Error(e));
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

// #endregion function_wrapper

// Main function
// #region main_function
async function main() {
  // Tell where to listening
  Log("Listening to " + TargetRepository + " Branch: " + TargetBranch);

  // Create directory
  await Lib.CreateDirectory(TargetDirectory);

  while (true) {
    try {
      // Get new commit SHA
      var NewSha = await GetLastCommitSha(OctonodeRepo, TargetBranch); // Try get new sha

      // Check current commit sha and new sha
      if (NewSha !== CheckSha) {
        // Log new commit
        Log(
          "New commit detected. New SHA: " +
            CheckSha.substring(0, 5) +
            " Old SHA: " +
            NewSha.substring(0, 5)
        );

        // Target directory of git clone
        var DestinationDirectory = Path.resolve(
          TargetDirectory,
          "repo-" + TargetBranch + "-" + NewSha
        );

        // #region Clone

        // Perform clone
        // Check Directory Exists
        var CheckRepoDirectory = await Lib.CheckDirectoryExists(
          DestinationDirectory
        );

        if (CheckRepoDirectory === true) {
          Log("No clone cause repository exists.");
        } else {
          await CloneRepo(RepositoryUrl, TargetBranch, DestinationDirectory);
          Log("Clone complete.");
        }

        // #endregion Clone

        // Check if repository have entry file
        // Entry file path
        var EntryFile = Path.join(DestinationDirectory, "deploy-entry.sh");

        // Check entry file exists in cloned directory
        var CheckEntryFileExists = await Lib.CheckFileExists(EntryFile);
        if (CheckEntryFileExists === true) {
          // Found entry file
          Log("Found entry file. executing...");
          Log("Execute directory: " + DestinationDirectory);

          // Change permission
          Lib.ShellJsChmod(777, EntryFile);

          // Start Execute
          await Lib.ShellJsExecute(EntryFile, DestinationDirectory);

          // Execute complete
          Log("Execute completed.");
        } else {
          // No file found
          Log("No entry file found.");
        }

        // Update current SHA
        CheckSha = NewSha;
      } else {
        // No new commit found
        // Log("No new commit found. " + CheckSha.substring(0, 5));
      }

      // Check should continue loop
      if (ShouldLoop === false) {
        break;
      }
    } catch (e) {
      // Somethig error
      Log("Something error.");
      if (DebugMode === true) {
        console.log(e);
      }
    }

    // Wait
    await Lib.Wait(RefreshRate);
  }
}
// #endregion main_function

// Execute main()
main();
