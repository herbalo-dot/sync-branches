const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  const fromBranch = core.getInput("FROM_BRANCH", { required: true });
  const toBranch = core.getInput("TO_BRANCH", { required: true });
  const githubToken = core.getInput("GITHUB_TOKEN", { required: true });

  try {
    console.log(`Making a pull request to ${toBranch} from ${fromBranch}.`);

    const {
      payload: { repository }
    } = github.context;

    const octokit = new github.GitHub(githubToken);

    const { data: currentPulls } = await octokit.pulls.list({
      owner: repository.owner.name,
      repo: repository.name
    });

    const currentPull = currentPulls.find(pull => {
      console.log(pull.head);
      console.log(pull.base);
      return pull.head === fromBranch && pull.base === toBranch;
    });
    console.log("????>>>>>>>: run -> currentPull", currentPull);

    if (!currentPull) {
      console.log("???????????? inside conditional ????????????", currentPull);
      console.log("???????????? inside conditional ????????????", !currentPull);
      const { data: pullRequest } = await octokit.pulls.create({
        owner: repository.owner.login,
        repo: repository.name,
        title: `sync: ${fromBranch} to ${toBranch}`,
        head: fromBranch,
        base: toBranch
      });

      console.log(
        `Pull request successful! You can view it here: ${pullRequest.url}.`
      );
    } else {
      console.log(
        `There is already a pull request to ${toBranch} from ${fromBranch}.`,
        `You can view it here: ${currentPull.url}`
      );
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
