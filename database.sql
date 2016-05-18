-- liquibase formatted sql

-- changeset reidd:1
CREATE TABLE UserConnection (userId varchar(255) NOT NULL,
  providerId VARCHAR(255) NOT NULL,
  providerUserId VARCHAR(255),
  rank INT NOT NULL,
  displayName VARCHAR(255),
  profileUrl VARCHAR(512),
  imageUrl VARCHAR(512),
  accessToken VARCHAR(255) NOT NULL,
  secret VARCHAR(255),
  refreshToken VARCHAR(255),
  expireTime bigint,
  PRIMARY KEY (userId, providerId, providerUserId));
CREATE UNIQUE index UserConnectionRank ON UserConnection(userId, providerId, rank);

CREATE TABLE Account (id SERIAL NOT NULL,
            username VARCHAR UNIQUE,
            firstName VARCHAR NOT NULL,
            lastName VARCHAR NOT NULL,
            password VARCHAR DEFAULT '',
            PRIMARY KEY (id));

CREATE TABLE AccountRoles (
    accountId INT,
    role VARCHAR NOT NULL,
    FOREIGN KEY (accountId) REFERENCES Account(id)
);

CREATE TABLE Project (id SERIAL NOT NULL,
            owner INT,
            name VARCHAR NOT NULL,
            description TEXT NOT NULL,
            trialverseId INT,
            PRIMARY KEY (id),
            FOREIGN KEY(owner) REFERENCES Account(id));

CREATE TABLE Outcome (id SERIAL NOT NULL,
                      project INT,
                      name VARCHAR NOT NULL,
                      motivation TEXT NOT NULL,
                      semanticOutcomeLabel VARCHAR NOT NULL,
                      semanticOutcomeUri VARCHAR NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(project) REFERENCES Project(id));

CREATE TABLE Intervention (id SERIAL NOT NULL,
                           project INT,
                           name VARCHAR NOT NULL,
                           motivation TEXT NOT NULL,
                           semanticInterventionLabel VARCHAR NOT NULL,
                           semanticInterventionUri VARCHAR NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(project) REFERENCES Project(id));

CREATE TABLE Analysis (id SERIAL NOT NULL,
        projectId INT,
        name VARCHAR NOT NULL,
        analysisType VARCHAR NOT NULL,
        studyId INT,
  PRIMARY KEY (id),
  FOREIGN KEY(projectId) REFERENCES Project(id));

CREATE TABLE Analysis_Outcomes (
  AnalysisId INT,
  OutcomeId INT,
  PRIMARY KEY(AnalysisId, OutcomeId),
  FOREIGN KEY(AnalysisId) REFERENCES Analysis(id),
  FOREIGN KEY(OutcomeId) REFERENCES Outcome(id)
);

CREATE TABLE Analysis_Interventions (
  AnalysisId INT,
  InterventionId INT,
  PRIMARY KEY(AnalysisId, InterventionId),
  FOREIGN KEY(AnalysisId) REFERENCES Analysis(id),
  FOREIGN KEY(InterventionId) REFERENCES Intervention(id)
);

-- changeset reidd:2

CREATE TABLE Scenario (id SERIAL NOT NULL,
    						workspace INT NOT NULL,
    						title VARCHAR NOT NULL,
    						state VARCHAR NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(workspace) REFERENCES Analysis(id));

-- changeset reidd:3

ALTER TABLE Analysis ADD problem VARCHAR NULL;

-- changeset stroombergc:4
CREATE SEQUENCE shared_analysis_id_seq;

CREATE TABLE SingleStudyBenefitRiskAnalysis (id INT DEFAULT nextval('shared_analysis_id_seq') NOT NULL,
        projectId INT,
        name VARCHAR NOT NULL,
        studyId INT,
        problem VARCHAR NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(projectId) REFERENCES Project(id));

CREATE TABLE NetworkMetaAnalysis (id INT DEFAULT nextval('shared_analysis_id_seq') NOT NULL,
          projectId INT,
          name VARCHAR NOT NULL,
          studyId INT,
          outcomeId INT,
          problem VARCHAR NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(projectId) REFERENCES Project(id),
    FOREIGN KEY(outcomeId) REFERENCES Outcome(id));

DROP TABLE Analysis CASCADE;

ALTER TABLE Analysis_Outcomes RENAME TO SingleStudyBenefitRiskAnalysis_Outcome;
ALTER TABLE Analysis_Interventions RENAME TO SingleStudyBenefitRiskAnalysis_Intervention;

ALTER TABLE SingleStudyBenefitRiskAnalysis_Intervention ADD CONSTRAINT ssbr_analysis_interventions_analysisid_fkey FOREIGN KEY (analysisId) REFERENCES SingleStudyBenefitRiskAnalysis(id);
ALTER TABLE SingleStudyBenefitRiskAnalysis_Outcome ADD CONSTRAINT ssbr_analysis_outcomes_analysisid_fkey FOREIGN KEY (analysisId) REFERENCES SingleStudyBenefitRiskAnalysis(id);
ALTER TABLE scenario ADD CONSTRAINT ssbr_scenario_workspace_fkey FOREIGN KEY (workspace) REFERENCES SingleStudyBenefitRiskAnalysis(id);

-- changeset stroombergc:5
CREATE TABLE Model (
  id SERIAL NOT NULL,
  analysisId INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(analysisId) REFERENCES NetworkMetaAnalysis(id));

-- changeset reidd:6
CREATE TABLE ArmExclusion (
  id SERIAL NOT NULL,
  trialverseId BIGINT NOT NULL,
  analysisId INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(analysisId) REFERENCES NetworkMetaAnalysis(id)
);

-- changeset reidd:7
CREATE TABLE InterventionExclusion (
  id SERIAL NOT NULL,
  interventionId INT NOT NULL,
  analysisId INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(analysisId) REFERENCES NetworkMetaAnalysis(id),
  FOREIGN KEY(interventionId) REFERENCES Intervention(id)
);

-- changeset gertvv:8
ALTER TABLE NetworkMetaAnalysis DROP COLUMN studyId;
ALTER TABLE NetworkMetaAnalysis DROP COLUMN problem;

CREATE TABLE PataviTask (
  id SERIAL NOT NULL,
  modelId INT NOT NULL,
  method varchar,
  problem TEXT,
  result TEXT,
  PRIMARY KEY(id),
  FOREIGN KEY(modelId) REFERENCES Model(id)
);
-- changeset reidd:9
DROP TABLE InterventionExclusion CASCADE;

CREATE TABLE InterventionInclusion (
  id SERIAL NOT NULL,
  interventionId INT NOT NULL,
  analysisId INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(analysisId) REFERENCES NetworkMetaAnalysis(id),
  FOREIGN KEY(interventionId) REFERENCES Intervention(id)
);

--changeset reidd:10
ALTER TABLE Project DROP COLUMN trialverseId;
ALTER TABLE Project ADD COLUMN namespaceUid VARCHAR;

--changeset stroombergc:11
ALTER TABLE SingleStudyBenefitRiskAnalysis DROP COLUMN studyId;
ALTER TABLE SingleStudyBenefitRiskAnalysis ADD COLUMN studyUid VARCHAR;

--changeset stroombergc:12
ALTER TABLE ArmExclusion DROP COLUMN trialverseId;
ALTER TABLE ArmExclusion ADD COLUMN trialverseUid VARCHAR;

--changeset reidd:13
CREATE TABLE remarks (
  analysisId INT NOT NULL,
  remarks TEXT,
  PRIMARY KEY (analysisId),
  FOREIGN KEY(analysisId) REFERENCES SingleStudyBenefitRiskAnalysis(id)
);

--changeset stroombergc:14
ALTER TABLE project ADD COLUMN datasetVersion VARCHAR;
--rollback ALTER TABLE project DROP COLUMN datasetVersion

--changeset stroombergc:15
ALTER TABLE project ALTER column description DROP NOT NULL;
--rollback ALTER TABLE project ALTER COLUMN description SET NOT NULL;

--changeset reidd:16
ALTER TABLE SingleStudyBenefitRiskAnalysis DROP COLUMN studyUId;
ALTER TABLE SingleStudyBenefitRiskAnalysis ADD COLUMN studyGraphUid VARCHAR;
--rollback ALTER TABLE SingleStudyBenefitRiskAnalysis DROP COLUMN studyGraphUid;
--rollback ALTER TABLE SingleStudyBenefitRiskAnalysis ADD COLUMN studyUid VARCHAR;

--changeset stroombergc:17
DROP TABLE PataviTask;
ALTER TABLE model ADD COLUMN taskId INT;

--changeset stroombergc:18
ALTER TABLE model ADD COLUMN title VARCHAR NOT NULL DEFAULT 'model 1 (generated by conversion)' ;
--rollback ALTER TABLE model DROP COLUMN title;

--changeset reidd:19
ALTER TABLE model ADD COLUMN linearModel VARCHAR NOT NULL DEFAULT 'fixed';
--rollback ALTER TABLE model DROP COLUMN linearModel;

--changeset stroombergc:20
ALTER TABLE model ADD COLUMN modelType VARCHAR NOT NULL DEFAULT '{"type": "network"}';
--rollback ALTER TABLE model DROP COLUMN modelType;

--changeset stroombergc:21
ALTER TABLE model ALTER COLUMN linearModel SET DEFAULT 'random';
--rollback ALTER TABLE model ALTER COLUMN linearModel SET DEFAULT 'fixed';

--changeset reidd:22
ALTER TABLE model ADD COLUMN burnInIterations INT NOT NULL DEFAULT 5000;
ALTER TABLE model ADD COLUMN inferenceIterations INT NOT NULL DEFAULT 20000;
ALTER TABLE model ADD COLUMN thinningFactor INT NOT NULL DEFAULT 10;
--rollback ALTER TABLE model DROP COLUMN burnInIterations;
--rollback ALTER TABLE model DROP COLUMN inferenceIterations;
--rollback ALTER TABLE model DROP COLUMN thinningFactor;

--changeset stroombergc:23
BEGIN;
ALTER TABLE model ADD COLUMN likelihood VARCHAR(255);
ALTER TABLE model ADD COLUMN link VARCHAR(255);
ALTER TABLE model ALTER likelihood SET NOT NULL;
ALTER TABLE model ALTER link SET NOT NULL;
COMMIT;

--changeset stroombergc:24
ALTER TABLE model ADD COLUMN outcomeScale DOUBLE PRECISION;
--rollback ALTER TABLE model DROP COLUMN outcomeScale;

--changeset stroombergc:25
ALTER TABLE SingleStudyBenefitRiskAnalysis RENAME COLUMN name TO title;
--rollback ALTER TABLE SingleStudyBenefitRiskAnalysis RENAME COLUMN title TO name;
ALTER TABLE NetworkMetaAnalysis RENAME COLUMN name TO title;
--rollback ALTER TABLE NetworkMetaAnalysis RENAME COLUMN title TO name;

--changeset stroomberg:26
ALTER TABLE Account ADD COLUMN email VARCHAR(255);
--rollback ALTER TABLE Account DROP COLUMN email;

--changeset reidd:27
ALTER TABLE model ADD COLUMN heterogeneityPrior VARCHAR;
--rollback ALTER TABLE model DROP COLUMN heterogeneityPrior;

--changeset stroombergc:28
CREATE TABLE covariate (
  id SERIAL NOT NULL,
  project int,
  name varchar NOT NULL,
  motivation TEXT,
  definitionkey varchar NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(project) REFERENCES Project(id)
);
--rollback DROP TABLE covariate;

--changeset stroombergc:29
CREATE TABLE CovariateInclusion (
  id SERIAL NOT NULL,
  covariateId INT NOT NULL,
  analysisId INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(analysisId) REFERENCES NetworkMetaAnalysis(id),
  FOREIGN KEY(covariateId) REFERENCES covariate(id)
);
--rollback DROP TABLE CovariateInclusion;

--changeset stroombergc:30
ALTER TABLE model ADD COLUMN regressor VARCHAR;
--rollback ALTER TABLE model DROP COLUMN regressor;

--changeset stroombergc:31
ALTER TABLE model ADD COLUMN sensitivity VARCHAR;
--rollback ALTER TABLE model DROP COLUMN sensitivity;

--changeset reidd:32
ALTER TABLE NetworkMetaAnalysis ADD COLUMN primaryModel INT;
ALTER TABLE NetworkMetaAnalysis ADD FOREIGN KEY(primaryModel) REFERENCES model(id);
--rollback ALTER TABLE analysis DROP CONSTRAINT "analysis_primarymodel_fkey";
--rollback ALTER TABLE analysis DROP COLUMN primaryModel;

--changeset gertvv:33
-- merge trialverse schema
CREATE TABLE VersionMapping (id SERIAL NOT NULL,
    versionedDatasetUrl VARCHAR NOT NULL,
    ownerUuid VARCHAR NOT NULL,
    trialverseDatasetUrl VARCHAR NOT NULL,
    PRIMARY KEY (id));
--rollback DROP TABLE versionmapping;

CREATE TABLE ApplicationKey (id SERIAL NOT NULL,
            secretKey VARCHAR UNIQUE,
            accountId INT NOT NULL,
            applicationName VARCHAR NOT NULL,
            creationDate DATE NOT NULL,
            revocationDate DATE NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (accountId) REFERENCES Account(id));
--rollback DROP TABLE applicationkey;

--changeset reidd:34
ALTER TABLE account ADD CONSTRAINT unique_email UNIQUE (email);
--rollback ALTER TABLE account DROP CONSTRAINT unique_email;
ALTER TABLE account ALTER email SET NOT NULL;
--rollback ALTER TABLE account ALTER email DROP NOT NULL;

--changeset reidd:35
ALTER TABLE versionmapping ADD CONSTRAINT unique_versionedDatasetUrl unique(versionedDatasetUrl);
--rollback ALTER TABLE versionmapping DROP CONSTRAINT unique_versionedDatasetUrl;
ALTER TABLE versionmapping ADD CONSTRAINT unique_trialverseDatasetUrl UNIQUE(trialverseDatasetUrl);
--rollback ALTER TABLE versionmapping DROP CONSTRAINT unique_trialverseDatasetUrl;

--changeset reidd:36
UPDATE model SET heterogeneityprior = NULL WHERE heterogeneityprior = '{''type'': ''automatic'' }';

--changeset reidd:37
ALTER TABLE covariate DROP CONSTRAINT covariate_project_fkey ;
ALTER TABLE covariate ADD CONSTRAINT covariate_project_fkey FOREIGN KEY (project) REFERENCES project(id) ON DELETE CASCADE ;

ALTER TABLE intervention DROP CONSTRAINT intervention_project_fkey ;
ALTER TABLE intervention ADD CONSTRAINT intervention_project_fkey FOREIGN KEY (project) REFERENCES project(id) ON DELETE CASCADE ;

ALTER TABLE outcome DROP CONSTRAINT outcome_project_fkey ;
ALTER TABLE outcome ADD CONSTRAINT outcome_project_fkey FOREIGN KEY (project) REFERENCES project(id) ON DELETE CASCADE ;

ALTER TABLE networkmetaanalysis DROP CONSTRAINT networkmetaanalysis_projectid_fkey ;
ALTER TABLE networkmetaanalysis ADD CONSTRAINT networkmetaanalysis_projectid_fkey FOREIGN KEY (projectid) REFERENCES project(id) ON DELETE CASCADE ;

ALTER TABLE singlestudybenefitriskanalysis DROP CONSTRAINT singlestudybenefitriskanalysis_projectid_fkey ;
ALTER TABLE singlestudybenefitriskanalysis ADD CONSTRAINT singlestudybenefitriskanalysis_projectid_fkey FOREIGN KEY (projectid) REFERENCES project(id) ON DELETE CASCADE ;

ALTER TABLE singlestudybenefitriskanalysis_intervention DROP CONSTRAINT analysis_interventions_interventionid_fkey ;
ALTER TABLE singlestudybenefitriskanalysis_intervention ADD CONSTRAINT analysis_interventions_interventionid_fkey FOREIGN KEY (interventionid) REFERENCES intervention(id) ON DELETE CASCADE ;

ALTER TABLE singlestudybenefitriskanalysis_intervention DROP CONSTRAINT ssbr_analysis_interventions_analysisid_fkey ;
ALTER TABLE singlestudybenefitriskanalysis_intervention ADD CONSTRAINT ssbr_analysis_interventions_analysisid_fkey FOREIGN KEY (analysisid) REFERENCES singlestudybenefitriskanalysis(id) ON DELETE CASCADE ;

ALTER TABLE interventioninclusion DROP CONSTRAINT interventioninclusion_interventionid_fkey ;
ALTER TABLE interventioninclusion ADD CONSTRAINT interventioninclusion_interventionid_fkey FOREIGN KEY (interventionid) REFERENCES intervention(id) ON DELETE CASCADE ;

ALTER TABLE singlestudybenefitriskanalysis_outcome DROP CONSTRAINT analysis_outcomes_outcomeid_fkey ;
ALTER TABLE singlestudybenefitriskanalysis_outcome ADD CONSTRAINT analysis_outcomes_outcomeid_fkey FOREIGN KEY (outcomeid) REFERENCES outcome(id) ON DELETE CASCADE ;

ALTER TABLE networkmetaanalysis DROP CONSTRAINT networkmetaanalysis_outcomeid_fkey ;
ALTER TABLE networkmetaanalysis ADD CONSTRAINT networkmetaanalysis_outcomeid_fkey FOREIGN KEY (outcomeid) REFERENCES outcome(id) ON DELETE CASCADE ;

ALTER TABLE remarks DROP CONSTRAINT remarks_analysisid_fkey ;
ALTER TABLE remarks ADD CONSTRAINT remarks_analysisid_fkey FOREIGN KEY (analysisid) REFERENCES singlestudybenefitriskanalysis(id) ON DELETE CASCADE ;

ALTER TABLE singlestudybenefitriskanalysis_outcome DROP CONSTRAINT ssbr_analysis_outcomes_analysisid_fkey ;
ALTER TABLE singlestudybenefitriskanalysis_outcome ADD CONSTRAINT ssbr_analysis_outcomes_analysisid_fkey FOREIGN KEY (analysisid) REFERENCES singlestudybenefitriskanalysis(id) ON DELETE CASCADE ;

ALTER TABLE scenario DROP CONSTRAINT ssbr_scenario_workspace_fkey ;
ALTER TABLE scenario ADD CONSTRAINT ssbr_scenario_workspace_fkey FOREIGN KEY (workspace) REFERENCES singlestudybenefitriskanalysis(id) ON DELETE CASCADE ;

ALTER TABLE covariateinclusion DROP CONSTRAINT covariateinclusion_covariateid_fkey ;
ALTER TABLE covariateinclusion ADD CONSTRAINT covariateinclusion_covariateid_fkey FOREIGN KEY (covariateid) REFERENCES covariate(id) ON DELETE CASCADE ;

ALTER TABLE networkmetaanalysis DROP CONSTRAINT networkmetaanalysis_primarymodel_fkey ;
ALTER TABLE networkmetaanalysis ADD CONSTRAINT networkmetaanalysis_primarymodel_fkey FOREIGN KEY (primarymodel) REFERENCES model(id) ON DELETE SET NULL ;

ALTER TABLE model DROP CONSTRAINT model_analysisid_fkey ;
ALTER TABLE model ADD CONSTRAINT model_analysisid_fkey FOREIGN KEY (analysisid) REFERENCES networkmetaanalysis(id) ON DELETE CASCADE ;

ALTER TABLE armexclusion DROP CONSTRAINT armexclusion_analysisid_fkey ;
ALTER TABLE armexclusion ADD CONSTRAINT armexclusion_analysisid_fkey FOREIGN KEY (analysisid) REFERENCES networkmetaanalysis(id) ON DELETE CASCADE ;

--changeset reidd:38
CREATE TABLE MetaBenefitRiskAnalysis (
  id SERIAL NOT NULL,
  title VARCHAR NOT NULL,
  projectId INT NOT NULL,
  finalized BOOLEAN NOT NULL,
  problem VARCHAR,
  PRIMARY KEY (id),
  FOREIGN KEY(projectId) REFERENCES Project(id)
);

CREATE TABLE MetaBenefitRiskAnalysis_Alternative (
   analysisId INT,
   alternativeId INT,
   PRIMARY KEY(analysisId, alternativeId),
   FOREIGN KEY(analysisId) REFERENCES MetaBenefitRiskAnalysis(id),
   FOREIGN KEY(alternativeId) REFERENCES Intervention(id)
);

CREATE TABLE MbrOutcomeInclusion (
    metaBenefitRiskAnalysisId INT,
    outcomeId INT,
    networkMetaAnalysisId INT,
    modelId INT,
    baseline VARCHAR,
    PRIMARY KEY (metaBenefitRiskAnalysisId, outcomeId, networkMetaAnalysisId, modelId),
    FOREIGN KEY(metaBenefitRiskAnalysisId) REFERENCES MetaBenefitRiskAnalysis(id),
    FOREIGN KEY(outcomeId) REFERENCES Outcome(id),
    FOREIGN KEY(networkMetaAnalysisId) REFERENCES NetworkMetaAnalysis(id),
    FOREIGN KEY(modelId) REFERENCES Model(id)
);

ALTER TABLE scenario DROP CONSTRAINT IF EXISTS ssbr_scenario_workspace_fkey;

--rollback DROP TABLE MbrOutcomeInclusion;
--rollback DROP TABLE MetaBenefitRiskAnalysis_Alternative;
--rollback ALTER TABLE scenario ADD CONSTRAINT ssbr_scenario_workspace_fkey FOREIGN KEY (workspace) REFERENCES SingleStudyBenefitRiskAnalysis(id);

--changeset stroombergc:39
CREATE TABLE FeaturedDataset (
   dataseturl VARCHAR NOT NULL,
   PRIMARY KEY(dataseturl)
);
--rollback DROP TABLE FeaturedDataset;

--changeset reidd:40
ALTER TABLE covariate ADD COLUMN type VARCHAR NOT NULL DEFAULT 'STUDY_CHARACTERISTIC';
--rollback ALTER TABLE covariate DROP COLUMN type;

--changeset reidd:41
ALTER TABLE MetaBenefitRiskAnalysis DROP CONSTRAINT metabenefitriskanalysis_projectid_fkey ;
ALTER TABLE MetaBenefitRiskAnalysis ADD CONSTRAINT metabenefitriskanalysis_projectid_fkey FOREIGN KEY (projectid) REFERENCES project(id) ON DELETE CASCADE ;

--changeset reidd:42
ALTER TABLE metabenefitriskanalysis_alternative DROP CONSTRAINT metabenefitriskanalysis_alternative_alternativeid_fkey ;
ALTER TABLE metabenefitriskanalysis_alternative ADD CONSTRAINT metabenefitriskanalysis_alternative_alternativeid_fkey FOREIGN KEY (alternativeid) REFERENCES intervention(id) ON DELETE CASCADE ;

--changeset reidd:43
ALTER TABLE mbroutcomeinclusion DROP CONSTRAINT mbroutcomeinclusion_outcomeid_fkey;
ALTER TABLE mbroutcomeinclusion ADD CONSTRAINT mbroutcomeinclusion_outcomeid_fkey FOREIGN KEY (outcomeid) REFERENCES outcome(id) ON DELETE CASCADE;

--changeset reidd:44
ALTER TABLE interventioninclusion DROP CONSTRAINT interventioninclusion_analysisid_fkey ;
ALTER TABLE interventioninclusion ADD CONSTRAINT interventioninclusion_analysisid_fkey FOREIGN KEY (analysisid) REFERENCES networkmetaanalysis(id) ON DELETE CASCADE ;

--changeset reidd:45
ALTER TABLE intervention ALTER COLUMN motivation DROP NOT NULL;
ALTER TABLE outcome ALTER COLUMN motivation DROP NOT NULL;

--changeset reidd:46
ALTER TABLE intervention RENAME TO AbstractIntervention;

CREATE TABLE SimpleIntervention(
  simpleInterventionId INT NOT NULL,
  PRIMARY KEY(simpleInterventionId),
  FOREIGN KEY(simpleInterventionId) REFERENCES AbstractIntervention(id)
);

insert into SimpleIntervention (simpleInterventionId) SELECT id from AbstractIntervention;

CREATE TABLE FixedDoseIntervention (
  fixedInterventionId INT NOT NULL,
  lowerBoundType varchar,
  lowerBoundValue DOUBLE PRECISION,
  lowerBoundUnitName varchar,
  lowerBoundUnitPeriod varchar,
  upperBoundType varchar,
  upperBoundValue DOUBLE PRECISION,
  upperBoundUnitName varchar,
  upperBoundUnitPeriod varchar,
  PRIMARY KEY (fixedInterventionId),
  FOREIGN KEY(fixedInterventionId) REFERENCES AbstractIntervention(id)
 );

CREATE TABLE TitratedDoseIntervention (
  titratedInterventionId INT NOT NULL,
  minLowerBoundType varchar,
  minLowerBoundUnitName varchar,
  minLowerBoundUnitPeriod varchar,
  minLowerBoundValue DOUBLE PRECISION,
  minUpperBoundType varchar,
  minUpperBoundUnitName varchar,
  minUpperBoundUnitPeriod varchar,
  minUpperBoundValue DOUBLE PRECISION,
  maxLowerBoundType varchar,
  maxLowerBoundUnitName varchar,
  maxLowerBoundUnitPeriod varchar,
  maxLowerBoundValue DOUBLE PRECISION,
  maxUpperBoundType varchar,
  maxUpperBoundUnitName varchar,
  maxUpperBoundUnitPeriod varchar,
  maxUpperBoundValue DOUBLE PRECISION,
  PRIMARY KEY (titratedInterventionId),
  FOREIGN KEY(titratedInterventionId) REFERENCES AbstractIntervention(id)
);

CREATE TABLE BothDoseTypesIntervention (
  bothTypesInterventionId INT NOT NULL,
  minLowerBoundType varchar,
  minLowerBoundUnitName varchar,
  minLowerBoundUnitPeriod varchar,
  minLowerBoundValue DOUBLE PRECISION,
  minUpperBoundType varchar,
  minUpperBoundUnitName varchar,
  minUpperBoundUnitPeriod varchar,
  minUpperBoundValue DOUBLE PRECISION,
  maxLowerBoundType varchar,
  maxLowerBoundUnitName varchar,
  maxLowerBoundUnitPeriod varchar,
  maxLowerBoundValue DOUBLE PRECISION,
  maxUpperBoundType varchar,
  maxUpperBoundUnitName varchar,
  maxUpperBoundUnitPeriod varchar,
  maxUpperBoundValue DOUBLE PRECISION,
  PRIMARY KEY (bothTypesInterventionId),
  FOREIGN KEY(bothTypesInterventionId) REFERENCES AbstractIntervention(id)
);
CREATE SEQUENCE shared_intervention_id_seq;
select setval('shared_intervention_id_seq', (select max(id) from AbstractIntervention));
--rollback DROP TABLE FixedDoseIntervention;
--rollback DROP TABLE TitratedDoseIntervention;
--rollback DROP TABLE BothDoseTypesIntervention;
--rollback DROP SEQUENCE shared_intervention_id_seq;
--rollback DROP TABLE SimpleIntervention;
--rollback ALTER TABLE AbstractIntervention RENAME TO Intervention;

--changeset reidd:47
CREATE TABLE AbstractAnalysis(
  id INT NOT NULL,
  projectId INT NOT NULL,
  title VARCHAR NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY (projectId) REFERENCES project(id)
);
INSERT INTO AbstractAnalysis (id, projectId, title)
SELECT id, projectId, title FROM SingleStudyBenefitRiskAnalysis;
INSERT INTO AbstractAnalysis (id, projectId, title)
SELECT id, projectId, title FROM NetworkMetaAnalysis;
INSERT INTO AbstractAnalysis (id, projectId, title)
SELECT id, projectId, title FROM MetaBenefitRiskAnalysis;

ALTER TABLE interventioninclusion DROP CONSTRAINT interventioninclusion_analysisid_fkey;
ALTER TABLE interventioninclusion ADD CONSTRAINT interventioninclusion_analysisid_fkey FOREIGN KEY (analysisId) REFERENCES AbstractAnalysis(id);

INSERT INTO interventioninclusion (analysisid, interventionid) select analysisid, alternativeId from MetaBenefitRiskAnalysis_Alternative ;
DROP TABLE MetaBenefitRiskAnalysis_Alternative;

ALTER TABLE SingleStudyBenefitRiskAnalysis DROP CONSTRAINT singlestudybenefitriskanalysis_projectid_fkey;
ALTER TABLE SingleStudyBenefitRiskAnalysis DROP projectId;
ALTER TABLE SingleStudyBenefitRiskAnalysis DROP title;
ALTER TABLE NetworkMetaAnalysis DROP CONSTRAINT NetworkMetaAnalysis_projectid_fkey;
ALTER TABLE NetworkMetaAnalysis DROP COLUMN projectId;
ALTER TABLE NetworkMetaAnalysis DROP COLUMN title;
ALTER TABLE MetaBenefitRiskAnalysis DROP CONSTRAINT metabenefitriskanalysis_projectid_fkey;
ALTER TABLE MetaBenefitRiskAnalysis DROP COLUMN projectId;
ALTER TABLE MetaBenefitRiskAnalysis DROP COLUMN title;


select setval('shared_analysis_id_seq', (select max(id) from AbstractAnalysis));
-- rollback CREATE TABLE MetaBenefitRiskAnalysis_Alternative ( analysisId INT, alternativeId INT, PRIMARY KEY(analysisId, alternativeId), FOREIGN KEY(analysisId) REFERENCES MetaBenefitRiskAnalysis(id), FOREIGN KEY(alternativeId) REFERENCES abstractintervention(id));
-- rollback INSERT INTO MetaBenefitRiskAnalysis_Alternative (analysisid, alternativeId) select i.analysisid, i.interventionid from interventioninclusion i WHERE i.analysisid in (select id from metabenefitriskanalysis);
-- rollback DELETE FROM interventioninclusion i WHERE i.analysisid in (select id from metabenefitriskanalysis);
-- rollback ALTER TABLE SingleStudyBenefitRiskAnalysis ADD COLUMN projectId int;
-- rollback ALTER TABLE SingleStudyBenefitRiskAnalysis ADD CONSTRAINT singlestudybenefitriskanalysis_projectid_fkey FOREIGN KEY(projectId) REFERENCES project(id);
-- rollback ALTER TABLE SingleStudyBenefitRiskAnalysis ADD COLUMN title VARCHAR;
-- rollback ALTER TABLE NetworkMetaAnalysis ADD COLUMN projectId int;
-- rollback ALTER TABLE NetworkMetaAnalysis ADD CONSTRAINT NetworkMetaAnalysis_projectid_fkey FOREIGN KEY(projectId) REFERENCES project(id);
-- rollback ALTER TABLE NetworkMetaAnalysis ADD COLUMN title VARCHAR;
-- rollback ALTER TABLE MetaBenefitRiskAnalysis ADD COLUMN projectId int;
-- rollback ALTER TABLE MetaBenefitRiskAnalysis ADD CONSTRAINT metabenefitriskanalysis_projectid_fkey FOREIGN KEY(projectId) REFERENCES project(id);
-- rollback ALTER TABLE MetaBenefitRiskAnalysis ADD COLUMN title VARCHAR;
-- rollback ALTER TABLE interventioninclusion DROP CONSTRAINT interventioninclusion_analysisid_fkey;
-- rollback ALTER TABLE interventioninclusion ADD CONSTRAINT interventioninclusion_analysisid_fkey FOREIGN KEY (analysisId) REFERENCES NetworkMetaAnalysis(id);
-- rollback UPDATE SingleStudyBenefitRiskAnalysis s SET projectId = (select projectId from abstractanalysis aa where s.id = aa.id);
-- rollback UPDATE SingleStudyBenefitRiskAnalysis s SET title = (select title from abstractanalysis aa where s.id = aa.id);
-- rollback UPDATE NetworkMetaAnalysis s SET projectId = (select projectId from abstractanalysis aa where s.id = aa.id);
-- rollback UPDATE NetworkMetaAnalysis s SET title = (select title from abstractanalysis aa where s.id = aa.id);
-- rollback UPDATE MetaBenefitRiskAnalysis s SET projectId = (select projectId from abstractanalysis aa where s.id = aa.id);
-- rollback UPDATE MetaBenefitRiskAnalysis s SET title = (select title from abstractanalysis aa where s.id = aa.id);
-- rollback DROP TABLE AbstractAnalysis;

--changeset stroombergc:48
ALTER TABLE FixedDoseIntervention ADD COLUMN lowerBoundUnitConcept varchar;
ALTER TABLE FixedDoseIntervention ADD COLUMN upperBoundUnitConcept varchar;
ALTER TABLE TitratedDoseIntervention ADD COLUMN minLowerBoundUnitConcept varchar;
ALTER TABLE TitratedDoseIntervention ADD COLUMN minUpperBoundUnitConcept varchar;
ALTER TABLE TitratedDoseIntervention ADD COLUMN maxLowerBoundUnitConcept varchar;
ALTER TABLE TitratedDoseIntervention ADD COLUMN maxUpperBoundUnitConcept varchar;
ALTER TABLE BothDoseTypesIntervention ADD COLUMN minLowerBoundUnitConcept varchar;
ALTER TABLE BothDoseTypesIntervention ADD COLUMN minUpperBoundUnitConcept varchar;
ALTER TABLE BothDoseTypesIntervention ADD COLUMN maxLowerBoundUnitConcept varchar;
ALTER TABLE BothDoseTypesIntervention ADD COLUMN maxUpperBoundUnitConcept varchar;
--rollback ALTER TABLE FixedDoseIntervention DROP COLUMN lowerBoundUnitConcept ;
--rollback ALTER TABLE FixedDoseIntervention DROP COLUMN upperBoundUnitConcept ;
--rollback ALTER TABLE TitratedDoseIntervention DROP COLUMN minLowerBoundUnitConcept ;
--rollback ALTER TABLE TitratedDoseIntervention DROP COLUMN minUpperBoundUnitConcept ;
--rollback ALTER TABLE TitratedDoseIntervention DROP COLUMN maxLowerBoundUnitConcept ;
--rollback ALTER TABLE TitratedDoseIntervention DROP COLUMN maxUpperBoundUnitConcept ;
--rollback ALTER TABLE BothDoseTypesIntervention DROP COLUMN minLowerBoundUnitConcept ;
--rollback ALTER TABLE BothDoseTypesIntervention DROP COLUMN minUpperBoundUnitConcept ;
--rollback ALTER TABLE BothDoseTypesIntervention DROP COLUMN maxLowerBoundUnitConcept ;
--rollback ALTER TABLE BothDoseTypesIntervention DROP COLUMN maxUpperBoundUnitConcept ;

--changeset stroombergc:49
UPDATE abstractintervention SET semanticinterventionuri = CONCAT('http://trials.drugis.org/concepts/', semanticinterventionuri) WHERE LEFT(semanticinterventionuri, 4) <> 'http';
--rollback UPDATE abstractintervention SET semanticinterventionuri = RIGHT(semanticinterventionuri, 36) WHERE LEFT(semanticinterventionuri, 4) = 'http';

--changeset stroombergc:50
ALTER TABLE abstractanalysis DROP CONSTRAINT IF EXISTS abstractanalysis_projectid_fkey ;
ALTER TABLE abstractanalysis ADD CONSTRAINT abstractanalysis_projectid_fkey FOREIGN KEY (projectId) REFERENCES project(id) ON DELETE CASCADE;

ALTER TABLE SimpleIntervention DROP CONSTRAINT IF EXISTS simpleintervention_simpleinterventionid_fkey ;
ALTER TABLE SimpleIntervention ADD CONSTRAINT simpleintervention_simpleinterventionid_fkey FOREIGN KEY (simpleInterventionId) REFERENCES AbstractIntervention(id) ON DELETE CASCADE;

ALTER TABLE FixedDoseIntervention DROP CONSTRAINT IF EXISTS fixedintervention_fixedinterventionid_fkey ;
ALTER TABLE FixedDoseIntervention ADD CONSTRAINT fixedintervention_fixedinterventionid_fkey FOREIGN KEY (fixedInterventionId) REFERENCES AbstractIntervention(id) ON DELETE CASCADE;

ALTER TABLE TitratedDoseIntervention DROP CONSTRAINT IF EXISTS titratedintervention_titratedinterventionid_fkey ;
ALTER TABLE TitratedDoseIntervention ADD CONSTRAINT titratedintervention_titratedinterventionid_fkey FOREIGN KEY (titratedInterventionId) REFERENCES AbstractIntervention(id) ON DELETE CASCADE;

ALTER TABLE BothDoseTypesIntervention DROP CONSTRAINT IF EXISTS bothtypesintervention_bothtypesinterventionid_fkey ;
ALTER TABLE BothDoseTypesIntervention ADD CONSTRAINT bothtypesintervention_bothtypesinterventionid_fkey FOREIGN KEY (bothTypesInterventionId) REFERENCES AbstractIntervention(id) ON DELETE CASCADE;

--rollback ALTER TABLE BothDoseTypesIntervention DROP CONSTRAINT IF EXISTS bothtypesintervention_bothtypesinterventionid_fkey ;
--rollback ALTER TABLE TitratedDoseIntervention DROP CONSTRAINT IF EXISTS titratedintervention_titratedinterventionid_fkey ;
--rollback ALTER TABLE FixedDoseIntervention DROP CONSTRAINT IF EXISTS fixedintervention_fixedinterventionid_fkey ;
--rollback ALTER TABLE SimpleIntervention DROP CONSTRAINT IF EXISTS simpleintervention_simpleinterventionid_fkey ;
--rollback ALTER TABLE abstractanalysis DROP CONSTRAINT IF EXISTS abstractanalysis_projectid_fkey ;

--changeset stroombergc:51
INSERT INTO interventioninclusion (analysisid, interventionid) select analysisid, interventionid from singlestudybenefitriskanalysis_intervention ;
DROP TABLE SingleStudyBenefitRiskAnalysis_Intervention;
--rollback CREATE TABLE SingleStudyBenefitRiskAnalysis_Intervention (AnalysisId INT, InterventionId INT, PRIMARY KEY(AnalysisId, InterventionId), FOREIGN KEY(AnalysisId) REFERENCES SingleStudyBenefitRiskAnalysis(id),FOREIGN KEY(InterventionId) REFERENCES abstractintervention(id));
--rollback INSERT INTO SingleStudyBenefitRiskAnalysis_Intervention (analysisid, interventionid) select i.analysisid, i.interventionid from interventioninclusion i WHERE i.analysisid in (select id from singlestudybenefitriskanalysis);
--rollback DELETE FROM interventioninclusion i WHERE i.analysisid IN (select id from singlestudybenefitriskanalysis);

--changeset reidd:52
ALTER TABLE SingleStudyBenefitRiskAnalysis RENAME COLUMN studyGraphUid TO studyGraphUri;
--rollback ALTER TABLE SingleStudyBenefitRiskAnalysis RENAME COLUMN studyGraphUri TO studyGraphUid;

--changeset reidd:53
UPDATE covariate SET definitionkey = CONCAT('http://trials.drugis.org/', definitionkey) WHERE type = 'POPULATION_CHARACTERISTIC';
--rollback UPDATE covariate SET definitionkey = RIGHT(definitionkey, 36) WHERE type = 'POPULATION_CHARACTERISTIC';

--changeset reidd:54
UPDATE singlestudybenefitriskanalysis SET studyGraphUri=CONCAT('http://trials.drugis.org/graphs/', studyGraphUri) WHERE LEFT(studyGraphUri, 4) <> 'http';
--rollback UPDATE singlestudybenefitriskanalysis SET studyGraphUri = RIGHT(studyGraphUri, 36) WHERE LEFT(studyGraphUri, 4) = 'http';

--changeset reidd:55
UPDATE outcome SET semanticOutcomeUri=CONCAT('http://trials.drugis.org/concepts/', semanticOutcomeUri) WHERE LEFT(semanticOutcomeUri, 4) <> 'http';
--rollback UPDATE outcome SET semanticOutcomeUri=RIGHT(semanticOutcomeUri, 36) WHERE LEFT(semanticOutcomeUri, 4) = 'http';

--changeset reidd:56
UPDATE covariate SET definitionkey = CONCAT('http://trials.drugis.org/concepts/', RIGHT(definitionkey, 36)) WHERE type = 'POPULATION_CHARACTERISTIC' AND LEFT(definitionkey, 4) = 'http';
--rollback UPDATE covariate SET definitionkey = RIGHT(definitionkey, 36) WHERE type = 'POPULATION_CHARACTERISTIC';

--changeset reidd:57
ALTER TABLE model DROP COLUMN taskId;
ALTER TABLE model ADD COLUMN taskUrl VARCHAR;
--rollback ALTER TABLE model ADD COLUMN taskId int;
--rollback ALTER TABLE model DROP COLUMN taskUrl;
