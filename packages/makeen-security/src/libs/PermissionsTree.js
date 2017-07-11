import NotAllowed from '../errors/NotAllowed';
import TaskTree from './TaskTree';

class PermissionsTree extends TaskTree {
  runTask(isAllowed, task, ...args) {
    if (!isAllowed) {
      throw new NotAllowed();
    }

    return super.runTask(isAllowed, task, ...args);
  }

  runTasks(tasks, ...args) {
    return super.runTasks(tasks, ...args).catch(err => {
      if (err instanceof NotAllowed) {
        return false;
      }

      throw err;
    });
  }

  check(subject, path, ...args) {
    return super.run(path, ...[subject, ...args]);
  }
}

export default PermissionsTree;
