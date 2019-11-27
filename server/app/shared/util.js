function getProjectPath(projectName, projectType) {
    switch (projectType) {
        case 1:
            return '/data/static/' + projectName;
        case 2:
            return '/data/common/' + projectName;
        case 3:
            return '/data/serv/' + projectName;
        case 4:
            return '/data/web/' + projectName;
    }
    return '/data/unknow/' + projectName;
}

exports.getProjectPath = getProjectPath;