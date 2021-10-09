const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const should = chai.should();

chai.use(chaiHttp);

describe('Public endpoints', () => {
	describe('/GET info', () => {
		it('it should return app version and name', (done) => {
			const { name, version } = require('../../../package.json');
			chai.request(app)
				.get('/info')
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('name', name);
					res.body.should.have.property('version', version);
					done();
				});
		});
	});
});
