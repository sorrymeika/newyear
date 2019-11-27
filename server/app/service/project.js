const { Service } = require("egg");
const { getProjectPath } = require("../shared/util");

class ProjectNotExistsError extends Error {
    constructor(message) {
        super(message);
        this.code = 'project_not_exists';

        if (!message) {
            this.message = '项目不存在';
        }
    }
}

class ProjectService extends Service {
    async getProjects() {
        const rows = await this.app.mysql.query('select id,name,gitUrl,type,status,updateDt from project order by type asc,name asc');
        return rows;
    }

    async addProject({
        name,
        gitUrl,
        type
    }) {
        const { app } = this;

        const exists = await app.mysql.query('select id from project where gitUrl=? limit 1', [gitUrl]);
        if (exists && exists[0]) {
            throw new Error('git库已存在！');
        }

        const res = await app.mysql.insert('project', {
            name,
            gitUrl,
            type,
            status: 0
        });

        const gitId = res.insertId;

        const progress = (e) => {
            app.mysql.query('update project set log=concat_ws(\'\',log,?) where id=?', [e.data + "\n", gitId]);
        };

        app.execCommand('git', ['clone', gitUrl], {
            cwd: getProjectPath(name, type)
        }, progress);

        return res;
    }

    async deleteProject(projectId) {
        const res = await this.app.mysql.query('delete from project where id=?', [projectId]);
        return res;
    }

    async buildProject(projectId) {
        const rows = await this.app.mysql.query('select id,name,gitUrl,type from project where id=?', [projectId]);
        if (!rows.length) throw new ProjectNotExistsError();

        const project = rows[0];
        const builder = this.app.getBuilder(project);

        project.status = 2;

        builder.build();
    }

    async getBuildingInfo(projectId) {
        const rows = await this.app.mysql.query('select id,name,gitUrl,type from project where id=?', [projectId]);
        if (!rows.length) throw new ProjectNotExistsError();

        const project = rows[0];
        const builder = this.app.getBuilder(project);

        return {
            running: builder.running,
            success: builder.success,
            logs: builder.getLogs()
        };
    }
}

module.exports = ProjectService;
