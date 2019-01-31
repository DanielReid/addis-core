package org.drugis.addis.projects.service;

import com.google.common.collect.Sets;
import org.drugis.addis.analyses.model.*;
import org.drugis.addis.analyses.repository.AnalysisRepository;
import org.drugis.addis.analyses.repository.BenefitRiskAnalysisRepository;
import org.drugis.addis.analyses.service.AnalysisService;
import org.drugis.addis.covariates.Covariate;
import org.drugis.addis.covariates.CovariateRepository;
import org.drugis.addis.exception.MethodNotAllowedException;
import org.drugis.addis.exception.ProblemCreationException;
import org.drugis.addis.exception.ResourceDoesNotExistException;
import org.drugis.addis.interventions.controller.command.*;
import org.drugis.addis.interventions.model.*;
import org.drugis.addis.interventions.repository.InterventionRepository;
import org.drugis.addis.interventions.service.InterventionService;
import org.drugis.addis.models.Model;
import org.drugis.addis.models.repository.ModelRepository;
import org.drugis.addis.outcomes.Outcome;
import org.drugis.addis.outcomes.repository.OutcomeRepository;
import org.drugis.addis.problems.model.problemEntry.AbstractProblemEntry;
import org.drugis.addis.problems.model.AbstractProblem;
import org.drugis.addis.problems.model.problemEntry.AbsoluteContinuousProblemEntry;
import org.drugis.addis.problems.model.NetworkMetaAnalysisProblem;
import org.drugis.addis.problems.service.ProblemService;
import org.drugis.addis.projects.Project;
import org.drugis.addis.projects.ProjectCommand;
import org.drugis.addis.projects.repository.ProjectRepository;
import org.drugis.addis.projects.service.impl.ProjectServiceImpl;
import org.drugis.addis.projects.service.impl.UpdateProjectException;
import org.drugis.addis.scaledUnits.ScaledUnit;
import org.drugis.addis.scaledUnits.repository.ScaledUnitRepository;
import org.drugis.addis.scenarios.Scenario;
import org.drugis.addis.scenarios.repository.ScenarioRepository;
import org.drugis.addis.security.Account;
import org.drugis.addis.security.repository.AccountRepository;
import org.drugis.addis.subProblems.SubProblem;
import org.drugis.addis.subProblems.repository.SubProblemRepository;
import org.drugis.addis.trialverse.model.SemanticInterventionUriAndName;
import org.drugis.addis.trialverse.model.SemanticVariable;
import org.drugis.addis.trialverse.model.emun.CovariateOption;
import org.drugis.addis.trialverse.model.emun.CovariateOptionType;
import org.drugis.addis.trialverse.service.TriplestoreService;
import org.drugis.addis.trialverse.service.impl.ReadValueException;
import org.drugis.trialverse.dataset.model.VersionMapping;
import org.drugis.trialverse.dataset.repository.VersionMappingRepository;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import javax.persistence.EntityManager;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.Principal;
import java.util.*;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;

/**
 * Created by connor on 16-4-14.
 */
public class ProjectServiceTest {

  @Mock
  private AccountRepository accountRepository;

  @Mock
  private ProjectRepository projectRepository;

  @Mock
  private VersionMappingRepository versionMappingRepository;

  @Mock
  private OutcomeRepository outcomeRepository;

  @Mock
  private CovariateRepository covariateRepository;

  @Mock
  private InterventionRepository interventionRepository;

  @Mock
  private TriplestoreService triplestoreService;

  @Mock
  private AnalysisRepository analysisRepository;

  @Mock
  private ModelRepository modelRepository;

  @Mock
  private ScenarioRepository scenarioRepository;

  @Mock
  private AnalysisService analysisService;

  @Mock
  private BenefitRiskAnalysisRepository benefitRiskAnalysisRepository;

  @Mock
  private EntityManager em;

  @Mock
  private ProblemService problemService;

  @Mock
  private SubProblemRepository subProblemRepository;

  @Mock
  private ScaledUnitRepository scaledUnitRepository;

  @InjectMocks
  private ProjectService projectService;

  private Integer projectId = 1;
  private String username = "gert";
  private Principal principal = mock(Principal.class);
  private Account account = mock(Account.class);
  private Project mockProject = mock(Project.class);
  private VersionMapping mapping = mock(VersionMapping.class);

  private static final String datasetUuid = "datasetUuid";
  private static final URI versionedDatasetUri = URI.create("http://trials.drugis.org/datasets/" + datasetUuid);
  private Integer subProblemId = 100;

  @Before
  public void setUp() throws ResourceDoesNotExistException, URISyntaxException {

    projectService = new ProjectServiceImpl();

    initMocks(this);

    when(mockProject.getOwner()).thenReturn(account);
    when(mockProject.getNamespaceUid()).thenReturn(datasetUuid);
    when(principal.getName()).thenReturn(username);
    when(projectRepository.get(projectId)).thenReturn(mockProject);
    when(accountRepository.findAccountByUsername(username)).thenReturn(account);
    when(versionMappingRepository.getVersionMappingByDatasetUrl(versionedDatasetUri)).thenReturn(mapping);
    when(mapping.getVersionedDatasetUri()).thenReturn(versionedDatasetUri);
  }

  @Test
  public void testCheckOwnership() throws Exception {
    projectService.checkOwnership(projectId, principal);
  }

  @Test(expected = MethodNotAllowedException.class)
  public void testOwnershipFails() throws MethodNotAllowedException, ResourceDoesNotExistException {
    Account account2 = mock(Account.class);

    when(mockProject.getOwner()).thenReturn(account2);

    projectService.checkOwnership(projectId, principal);
  }

  @Test
  public void update() throws ResourceDoesNotExistException, UpdateProjectException {
    String name = "name";
    String description = "description";
    when(projectRepository.isExistingProjectName(projectId, name)).thenReturn(Boolean.FALSE);
    when(projectRepository.updateNameAndDescription(projectId, name, description)).thenReturn(mockProject);
    Project project = projectService.updateProject(projectId, name, description);
    assertEquals(mockProject, project);
    verify(projectRepository).isExistingProjectName(projectId, name);
    verify(projectRepository).updateNameAndDescription(projectId, name, description);
  }

  @Test(expected = UpdateProjectException.class)
  public void updateDuplicateName() throws ResourceDoesNotExistException, UpdateProjectException {
    String name = "name";
    String description = "description";
    when(projectRepository.isExistingProjectName(projectId, name)).thenReturn(Boolean.TRUE);
    projectService.updateProject(projectId, name, description);
  }

  @Test
  public void testCopy() throws Exception, ReadValueException {
    Integer newProjectId = -3;
    String newTitle = "new project title";
    Project mockNewProject = mock(Project.class);
    ProjectCommand mockCommand = mock(ProjectCommand.class);

    when(mockProject.getCommand()).thenReturn(mockCommand);
    when(mockNewProject.getId()).thenReturn(newProjectId);
    when(mockProject.getDatasetVersion()).thenReturn(URI.create("http://mockProject/version1/"));
    when(projectRepository.create(account, mockCommand)).thenReturn(mockNewProject);

    // Outcomes
    SemanticVariable semanticOutcome1 = new SemanticVariable(URI.create("http://www.bs.org/outcomeIn"), "semanticLabel1");
    SemanticVariable semanticOutcome2 = new SemanticVariable(URI.create("http://www.bs.org/outcomeOut"), "semanticLabel2");
    Integer outcomeId1 = 980;
    Integer outcomeId2 = 1024;
    Outcome outcome1 = new Outcome(outcomeId1, projectId, "outcome1", "motivation", semanticOutcome1);
    Outcome outcome2 = new Outcome(outcomeId2, projectId, "outcome2", "motivation", semanticOutcome2);
    Collection<Outcome> sourceOutcomes = Arrays.asList(outcome1, outcome2);

    when(outcomeRepository.get(outcome1.getId())).thenReturn(outcome1);
    when(outcomeRepository.get(outcome2.getId())).thenReturn(outcome2);
    when(outcomeRepository.query(projectId)).thenReturn(sourceOutcomes);
    Outcome newOutcome1 = new Outcome(outcomeId1 + 1, newProjectId, outcome1.getName(), outcome1.getDirection(),
            outcome1.getMotivation(), outcome1.getSemanticVariable());
    Outcome newOutcome2 = new Outcome(outcomeId2 + 1, newProjectId, outcome2.getName(), outcome2.getDirection(),
            outcome2.getMotivation(), outcome2.getSemanticVariable());
    when(outcomeRepository.create(account, newProjectId, outcome1.getName(), outcome1.getDirection(), outcome1.getMotivation(),
            outcome1.getSemanticVariable())).thenReturn(newOutcome1);
    when(outcomeRepository.create(account, newProjectId, outcome2.getName(), outcome2.getDirection(), outcome2.getMotivation(),
            outcome2.getSemanticVariable())).thenReturn(newOutcome2);

    // Covariates
    Covariate covariate1 = new Covariate(-10, newProjectId, "covariate 1", null, "http://covariates.nl/1",
            CovariateOptionType.POPULATION_CHARACTERISTIC);
    Covariate covariate2 = new Covariate(-11, newProjectId, "covariate 2", null, "http://covariates.nl/2",
            CovariateOptionType.POPULATION_CHARACTERISTIC);
    Covariate covariateStudyLevel = new Covariate(-13, newProjectId, "covariate study level", null,
            CovariateOption.LENGTH_OF_FOLLOW_UP.toString(), CovariateOptionType.STUDY_CHARACTERISTIC);
    Collection<Covariate> covariates = Arrays.asList(covariate1, covariate2, covariateStudyLevel);

    when(covariateRepository.findByProject(projectId)).thenReturn(covariates);
    when(covariateRepository.createForProject(newProjectId, covariate1.getDefinitionKey(), covariate1.getName(),
            covariate1.getMotivation(), covariate1.getType())).thenReturn(covariate1);
    when(covariateRepository.createForProject(newProjectId, covariate2.getDefinitionKey(), covariate2.getName(),
            covariate2.getMotivation(), covariate2.getType())).thenReturn(covariate2);
    when(covariateRepository.createForProject(newProjectId, covariateStudyLevel.getDefinitionKey(), covariateStudyLevel.getName(),
            covariateStudyLevel.getMotivation(), covariateStudyLevel.getType())).thenReturn(covariateStudyLevel);

    //units
    ScaledUnit scaledUnit = new ScaledUnit(1, projectId, URI.create("gram"), 0.001, "milligram");
    when(scaledUnitRepository.query(projectId)).thenReturn(Collections.singletonList(scaledUnit));

    // Interventions - getting old interventions
    URI semanticInterventionUri = URI.create("http://bla.com/semanticInterventions/1");
    String semanticInterventionLabel = "semantic intervention label";
    SimpleIntervention simpleIntervention = new SimpleIntervention(1, projectId, "simple", null,
            semanticInterventionUri, semanticInterventionLabel);
    URI gramUri = URI.create("http://trials.drugis.org/concepts/gram");
    LowerBoundCommand lowerBound = new LowerBoundCommand(LowerBoundType.AT_LEAST, 0.1, "mg", "pt1d",
            gramUri, null);
    DoseConstraint constraint = new DoseConstraint(lowerBound, null);
    FixedDoseIntervention fixedDoseIntervention = new FixedDoseIntervention(3, projectId, "fixed dose", null,
            semanticInterventionUri, semanticInterventionLabel, constraint);
    TitratedDoseIntervention titratedDoseIntervention = new TitratedDoseIntervention(5, projectId, "titrated dose", null,
            semanticInterventionUri, semanticInterventionLabel, constraint, null);
    BothDoseTypesIntervention bothDoseTypesIntervention = new BothDoseTypesIntervention(7, projectId, "both dose", null,
            semanticInterventionUri, semanticInterventionLabel, null, constraint);
    CombinationIntervention combinationIntervention = new CombinationIntervention(9, projectId, "combo", null,
            Sets.newHashSet(simpleIntervention.getId(), fixedDoseIntervention.getId()));
    InterventionSet interventionSet = new InterventionSet(11, projectId, "set", null,
            Sets.newHashSet(combinationIntervention.getId(), titratedDoseIntervention.getId()));

    Set<AbstractIntervention> sourceInterventions = Sets.newHashSet(simpleIntervention, fixedDoseIntervention,
            titratedDoseIntervention, bothDoseTypesIntervention, combinationIntervention, interventionSet);
    when(interventionRepository.query(projectId)).thenReturn(sourceInterventions);

    // Interventions - creating new interventions
    AbstractInterventionCommand simpleCommand = InterventionService.buildSingleInterventionCommand(newProjectId, simpleIntervention);
    AbstractInterventionCommand fixedCommand = InterventionService.buildSingleInterventionCommand(newProjectId, fixedDoseIntervention);
    AbstractInterventionCommand titratedCommand = InterventionService.buildSingleInterventionCommand(newProjectId, titratedDoseIntervention);
    AbstractInterventionCommand bothTypesCommand = InterventionService.buildSingleInterventionCommand(newProjectId, bothDoseTypesIntervention);
    mockCreateSingleIntervention(simpleIntervention, SimpleIntervention.class, simpleCommand);
    mockCreateSingleIntervention(fixedDoseIntervention, FixedDoseIntervention.class, fixedCommand);
    mockCreateSingleIntervention(titratedDoseIntervention, TitratedDoseIntervention.class, titratedCommand);
    mockCreateSingleIntervention(bothDoseTypesIntervention, BothDoseTypesIntervention.class, bothTypesCommand);
    AbstractInterventionCommand combiCommand = new CombinationInterventionCommand(newProjectId, combinationIntervention.getName(),
            combinationIntervention.getMotivation(), Sets.newHashSet(-simpleIntervention.getId(), -fixedDoseIntervention.getId()));
    CombinationIntervention newCombination = mock(CombinationIntervention.class);
    AbstractInterventionCommand setCommand = new InterventionSetCommand(newProjectId, interventionSet.getName(),
            interventionSet.getMotivation(), Sets.newHashSet(-combinationIntervention.getId(), -titratedDoseIntervention.getId()));
    InterventionSet newSet = mock(InterventionSet.class);

    when(newCombination.getId()).thenReturn(-combinationIntervention.getId());
    when(interventionRepository.create(account, combiCommand)).thenReturn(newCombination);
    when(newSet.getId()).thenReturn(-combinationIntervention.getId());
    when(interventionRepository.create(account, setCommand)).thenReturn(newSet);

    // Analyses
    Integer nmaId1 = 42;
    List<ArmExclusion> nmaExcludedArms = Collections.singletonList(new ArmExclusion(nmaId1, URI.create("http://anything.Groningen")));
    List<InterventionInclusion> nmaInterventionInclusions1 = Collections.singletonList(new InterventionInclusion(nmaId1, fixedDoseIntervention.getId()));
    List<CovariateInclusion> nmaIncludedCovariates1 = Collections.singletonList(new CovariateInclusion(nmaId1, covariate1.getId()));
    AbstractAnalysis nma1 = new NetworkMetaAnalysis(nmaId1, projectId, "nma1", nmaExcludedArms, nmaInterventionInclusions1, nmaIncludedCovariates1, outcome1);
    AnalysisCommand nmaCommand1 = new AnalysisCommand(newProjectId, nma1.getTitle(), AnalysisType.EVIDENCE_SYNTHESIS);
    when(analysisService.createNetworkMetaAnalysis(account, nmaCommand1)).thenReturn(new NetworkMetaAnalysis(nmaId1 + 1, projectId, "nma1",
            Collections.emptyList(), Collections.emptyList(), Collections.emptyList(), outcome1));

    Integer nmaId2 = 1337;
    List<InterventionInclusion> nmaInterventionInclusions2 = Collections.singletonList(new InterventionInclusion(nmaId2, titratedDoseIntervention.getId()));
    AbstractAnalysis nma2 = new NetworkMetaAnalysis(nmaId2, projectId, "nma2", Collections.emptyList(), nmaInterventionInclusions2, Collections.emptyList(), outcome2);
    AnalysisCommand nmaCommand2 = new AnalysisCommand(newProjectId, nma2.getTitle(), AnalysisType.EVIDENCE_SYNTHESIS);
    when(analysisService.createNetworkMetaAnalysis(account, nmaCommand2)).thenReturn(new NetworkMetaAnalysis(nmaId2 + 1, projectId, "nma2",
            Collections.emptyList(), Collections.emptyList(), Collections.emptyList(), outcome1));

    //models before Metabr
    Integer modelId1 = 1414;
    Integer modelId2 = 5318008;
    Model model1 = new Model.ModelBuilder(nmaId1, "model 1")
            .id(modelId1)
            .link("identity")
            .modelType(Model.NETWORK_MODEL_TYPE)
            .build();
    Model model2 = new Model.ModelBuilder(nmaId1, "model 2")
            .id(modelId2)
            .link("identity")
            .modelType(Model.NETWORK_MODEL_TYPE).build();
    when(modelRepository.findModelsByProject(projectId)).thenReturn(Arrays.asList(model1, model2));
    Model newModel1 = new Model(model1);
    newModel1.setAnalysisId(nmaId1 + 1);
    Model persistedModel1 = new Model(newModel1);
    persistedModel1.setId(modelId1 + 1);
    Model newModel2 = new Model(model2);
    newModel2.setAnalysisId(nmaId1 + 1);
    Model persistedModel2 = new Model(newModel2);
    persistedModel2.setId(modelId2 + 1);
    when(modelRepository.persist(newModel1)).thenReturn(persistedModel1);
    when(modelRepository.persist(newModel2)).thenReturn(persistedModel2);

    //metabr
    Integer metaBRId = 707;
    Set<InterventionInclusion> mbrInterventionInclusions = Sets.newHashSet(new InterventionInclusion(metaBRId, fixedDoseIntervention.getId()));
    BenefitRiskAnalysis metaBR = new BenefitRiskAnalysis(metaBRId, projectId, "mbr", mbrInterventionInclusions);
    List<BenefitRiskNMAOutcomeInclusion> benefitRiskNMAOutcomeInclusions = Collections.singletonList(
            new BenefitRiskNMAOutcomeInclusion(metaBRId, outcome2.getId(), nmaId2, modelId2));
    List<BenefitRiskStudyOutcomeInclusion> benefitRiskStudyOutcomeInclusions = Collections.singletonList(new BenefitRiskStudyOutcomeInclusion(metaBRId, outcome1.getId(), URI.create("http://study1.uri")));
    metaBR.setBenefitRiskNMAOutcomeInclusions(benefitRiskNMAOutcomeInclusions);
    metaBR.setBenefitRiskStudyOutcomeInclusions(benefitRiskStudyOutcomeInclusions);
    List<AbstractAnalysis> sourceAnalyses = Arrays.asList(nma1, nma2, metaBR);
    when(analysisRepository.query(projectId)).thenReturn(sourceAnalyses);
    AnalysisCommand metaBRCommand = new AnalysisCommand(newProjectId, metaBR.getTitle(), AnalysisType.BENEFIT_RISK_ANALYSIS_LABEL);
    BenefitRiskAnalysis newMetaBR = new BenefitRiskAnalysis(metaBRId + 1, newProjectId, metaBR.getTitle());
    when(benefitRiskAnalysisRepository.create(account, metaBRCommand)).thenReturn(newMetaBR);

    //subProblems
    String mbrDef = "mbr def";
    int mbrSubProblemId = 1234;
    SubProblem mbrSubProblem = new SubProblem(mbrSubProblemId, metaBRId, mbrDef, "Default");
    Collection<SubProblem> subProblems = Collections.singletonList(mbrSubProblem);
    when(subProblemRepository.queryByProject(projectId)).thenReturn(subProblems);
    Integer newMbrSubProblemId = 4321;
    SubProblem newMbrSubProblem = new SubProblem(newMbrSubProblemId, newMetaBR.getId(), mbrDef, "Default");
    when(subProblemRepository.create(newMetaBR.getId(), mbrDef, "Default")).thenReturn(newMbrSubProblem);

    //scenarios
    Integer scenarioId2 = 313;
    Scenario scenario2 = new Scenario(scenarioId2, metaBRId, mbrSubProblemId, "scenario 2", "Missouri");
    Collection<Scenario> scenarios = Collections.singletonList(scenario2);
    when(scenarioRepository.queryByProject(projectId)).thenReturn(scenarios);
    Scenario newScenario2 = new Scenario(scenarioId2 + 1, newMetaBR.getId(), scenario2.getTitle(), scenario2.getState());
    when(scenarioRepository.create(newMetaBR.getId(), newMbrSubProblemId, scenario2.getTitle(),
            scenario2.getState())).thenReturn(newScenario2);

    /// *8888888888**************************** GO *********************888888888888888* ///
    Integer copiedId = projectService.copy(account, projectId, newTitle);
    /// *8888888888**************************** GO *********************888888888888888* ///

    assertEquals(newProjectId, copiedId);

    verify(outcomeRepository).query(projectId);
    verify(outcomeRepository).create(account, newProjectId, outcome1.getName(), outcome1.getDirection(), outcome1.getMotivation(),
            outcome1.getSemanticVariable());
    verify(outcomeRepository).create(account, newProjectId, outcome2.getName(), outcome2.getDirection(), outcome2.getMotivation(),
            outcome2.getSemanticVariable());
    verify(outcomeRepository, times(1)).get(newOutcome1.getId());
    verify(outcomeRepository, times(1)).get(newOutcome2.getId());
    verifyNoMoreInteractions(outcomeRepository);

    verify(scaledUnitRepository).query(projectId);

    verify(covariateRepository).findByProject(projectId);
    verify(covariateRepository).createForProject(newProjectId, covariate1.getDefinitionKey(), covariate1.getName(),
            covariate1.getMotivation(), CovariateOptionType.POPULATION_CHARACTERISTIC);
    verify(covariateRepository).createForProject(newProjectId, covariate2.getDefinitionKey(), covariate2.getName(),
            covariate2.getMotivation(), CovariateOptionType.POPULATION_CHARACTERISTIC);
    verify(covariateRepository).createForProject(newProjectId, covariateStudyLevel.getDefinitionKey(), covariateStudyLevel.getName(),
            covariateStudyLevel.getMotivation(), CovariateOptionType.STUDY_CHARACTERISTIC);
    verifyNoMoreInteractions(covariateRepository);

    verify(interventionRepository).query(projectId);
    verify(interventionRepository).create(account, simpleCommand);
    verify(interventionRepository).create(account, fixedCommand);
    verify(interventionRepository).create(account, titratedCommand);
    verify(interventionRepository).create(account, bothTypesCommand);
    verify(interventionRepository).create(account, combiCommand);
    verify(interventionRepository).create(account, setCommand);
    verifyNoMoreInteractions(interventionRepository);

    verify(analysisRepository).query(projectId);
    verify(analysisService).createNetworkMetaAnalysis(account, nmaCommand1);
    verify(analysisService).createNetworkMetaAnalysis(account, nmaCommand2);
    verifyNoMoreInteractions(analysisService);

    verify(modelRepository).findModelsByProject(projectId);
    verify(modelRepository).persist(newModel1);
    verify(modelRepository).persist(newModel2);
    verifyNoMoreInteractions(modelRepository);

    verify(scenarioRepository).queryByProject(projectId);
    verify(scenarioRepository).create(metaBRId + 1, newMbrSubProblemId, scenario2.getTitle(), scenario2.getState());
    verifyNoMoreInteractions(scenarioRepository);
  }

  @Test
  public void createUpdated() throws Exception, ReadValueException, ProblemCreationException {
    Integer newProjectId = -3;
    URI headVersion = URI.create("http://www.drugis.org/datasets/headversion");
    ProjectCommand mockCommand = mock(ProjectCommand.class);
    Project mockNewProject = mock(Project.class);

    when(mockProject.getCommand()).thenReturn(mockCommand);
    when(mockNewProject.getId()).thenReturn(newProjectId);
    when(triplestoreService.getHeadVersion((mapping.getVersionedDatasetUri()))).thenReturn(headVersion.toString());
    when(projectRepository.create(account, mockCommand)).thenReturn(mockNewProject);

    // Outcomes
    Integer filteredInOutcomeId = 1;
    Integer filteredOutOutcomeId = 2;
    SemanticVariable semanticOutcomeFilteredIn = new SemanticVariable(URI.create("http://www.bs.org/outcomeIn"), "semanticLabel1");
    SemanticVariable semanticOutcomeFilteredOut = new SemanticVariable(URI.create("http://www.bs.org/outcomeOut"), "semanticLabel2");
    Outcome outcomeFilteredIn = new Outcome(filteredInOutcomeId, projectId, "outcome1", "motivation", semanticOutcomeFilteredIn);
    Outcome outcomeFilteredOut = new Outcome(filteredOutOutcomeId, projectId, "outcome2", "motivation", semanticOutcomeFilteredOut);
    Collection<Outcome> sourceOutcomes = Arrays.asList(outcomeFilteredIn, outcomeFilteredOut);
    SemanticVariable semanticOutcome = new SemanticVariable(semanticOutcomeFilteredIn.getUri(), semanticOutcomeFilteredIn.getLabel());
    List<SemanticVariable> semanticOutcomes = Collections.singletonList(semanticOutcome);
    Outcome newMockOutcome = mock(Outcome.class);
    when(triplestoreService.getOutcomes(datasetUuid, headVersion)).thenReturn(semanticOutcomes);
    when(outcomeRepository.query(projectId)).thenReturn(sourceOutcomes);
    when(outcomeRepository.create(account, newProjectId, outcomeFilteredIn.getName(), outcomeFilteredIn.getDirection(), outcomeFilteredIn.getMotivation(),
            outcomeFilteredIn.getSemanticVariable())).thenReturn(newMockOutcome);

    // Covariates
    URI covariateFilteredInUri = URI.create("http://trials.drugis.org/concepts/age");
    Integer covariateInId = -10;
    Covariate covariateFilteredIn = new Covariate(covariateInId, newProjectId, "covariate in", null, covariateFilteredInUri.toString(),
            CovariateOptionType.POPULATION_CHARACTERISTIC);
    Covariate covariateFilteredOut = new Covariate(-11, newProjectId, "covariate out", null, "http://nothere.com",
            CovariateOptionType.POPULATION_CHARACTERISTIC);
    Covariate covariateStudyLevel = new Covariate(-13, newProjectId, "covariate study level", null,
            CovariateOption.LENGTH_OF_FOLLOW_UP.toString(), CovariateOptionType.STUDY_CHARACTERISTIC);
    Collection<Covariate> covariates = Arrays.asList(covariateFilteredIn, covariateFilteredOut, covariateStudyLevel);
    SemanticVariable semanticCovariateFilteredIn = new SemanticVariable(covariateFilteredInUri, "bla");
    when(covariateRepository.findByProject(projectId)).thenReturn(covariates);
    when(covariateRepository.createForProject(newProjectId, covariateFilteredIn.getDefinitionKey(), covariateFilteredIn.getName(),
            covariateFilteredIn.getMotivation(), covariateFilteredIn.getType())).thenReturn(covariateFilteredIn);
    when(covariateRepository.createForProject(newProjectId, covariateStudyLevel.getDefinitionKey(), covariateStudyLevel.getName(),
            covariateStudyLevel.getMotivation(), covariateStudyLevel.getType())).thenReturn(covariateStudyLevel);

    List<SemanticVariable> populationCharacteristics = Collections.singletonList(semanticCovariateFilteredIn);
    when(triplestoreService.getPopulationCharacteristics(datasetUuid, headVersion)).thenReturn(populationCharacteristics);

    //units
    ScaledUnit scaledUnit = new ScaledUnit(1, projectId, URI.create("gram"), 0.001, "milligram");
    when(scaledUnitRepository.query(projectId)).thenReturn(Collections.singletonList(scaledUnit));

    // Interventions
    // Cases:
    // - simple intervention, semantic concept still in dataset
    // - simple intervention, semantic concept no longer in dataset
    // - fixed dose intervention, units and concept still in dataset
    // - fixed dose intervention, units no longer in dataset
    // - titrated dose intervention, units and concept still in dataset
    // - titrated dose intervention, units no longer in dataset
    // - bothtypes intervention, units and concept still in dataset
    // - bothtypes intervention, units no longer in dataset
    // - combination intervention, component interventions successfully copied
    // - combination intervention, component interventions not successfully copied
    // - intervention set, component interventions (combination intervention among them) successfully copied
    // - intervention set, component interventions (combination intervention among them) not successfully copied
    URI semanticInterventionUri = URI.create("http://bla.com/semanticInterventions/1");
    SimpleIntervention simpleInterventionFilteredIn = new SimpleIntervention(1, projectId, "simple in", null,
            semanticInterventionUri, "semantic intervention label");
    SimpleIntervention simpleInterventionFilteredOut = new SimpleIntervention(2, projectId, "simple out", null,
            URI.create("http://bla.com/semanticInterventions/2"), "semantic intervention label");
    URI gramUri = URI.create("http://trials.drugis.org/concepts/gram");
    LowerBoundCommand lowerBoundFilteredIn = new LowerBoundCommand(LowerBoundType.AT_LEAST, 0.1, "mg", "pt1d",
            gramUri, null);
    LowerBoundCommand lowerBoundFilteredOut = new LowerBoundCommand(LowerBoundType.AT_LEAST, 0.1, "mg", "pt1d",
            URI.create("http://nonsense.com"), null);
    UpperBoundCommand upperBound = null;
    DoseConstraint constraintFilteredIn = new DoseConstraint(lowerBoundFilteredIn, upperBound);
    DoseConstraint constraintFilteredOut = new DoseConstraint(lowerBoundFilteredOut, upperBound);
    FixedDoseIntervention fixedDoseInterventionFilteredIn = new FixedDoseIntervention(3, projectId, "fixed dose in", null,
            semanticInterventionUri, "semantic intervention label", constraintFilteredIn);
    FixedDoseIntervention fixedDoseInterventionFilteredOut = new FixedDoseIntervention(4, projectId, "fixed dose out", null,
            semanticInterventionUri, "semantic intervention label", constraintFilteredOut);
    TitratedDoseIntervention titratedDoseInterventionFilteredIn = new TitratedDoseIntervention(5, projectId, "titrated dose in", null,
            semanticInterventionUri, "semantic intervention label", constraintFilteredIn, null);
    TitratedDoseIntervention titratedDoseInterventionFilteredOut = new TitratedDoseIntervention(6, projectId, "titrated dose out", null,
            semanticInterventionUri, "semantic intervention label", null, constraintFilteredOut);
    BothDoseTypesIntervention bothDoseTypesInterventionFilteredIn = new BothDoseTypesIntervention(7, projectId, "both dose in", null,
            semanticInterventionUri, "semantic intervention label", null, constraintFilteredIn);
    BothDoseTypesIntervention bothDoseTypesInterventionFilteredOut = new BothDoseTypesIntervention(8, projectId, "both dose out", null,
            semanticInterventionUri, "semantic intervention label", null, constraintFilteredOut);
    CombinationIntervention combinationInterventionFilteredIn = new CombinationIntervention(9, projectId, "combo in", null,
            Sets.newHashSet(simpleInterventionFilteredIn.getId(), fixedDoseInterventionFilteredIn.getId()));
    CombinationIntervention combinationInterventionFilteredOut = new CombinationIntervention(10, projectId, "combo out", null,
            Sets.newHashSet(simpleInterventionFilteredIn.getId(), titratedDoseInterventionFilteredOut.getId()));
    InterventionSet interventionSetFilteredIn = new InterventionSet(11, projectId, "set in", null,
            Sets.newHashSet(combinationInterventionFilteredIn.getId(), titratedDoseInterventionFilteredIn.getId()));
    InterventionSet interventionSetFilteredOut = new InterventionSet(12, projectId, "set out", null,
            Sets.newHashSet(combinationInterventionFilteredOut.getId(), titratedDoseInterventionFilteredIn.getId()));

    Set<AbstractIntervention> sourceInterventions = Sets.newHashSet(simpleInterventionFilteredIn, simpleInterventionFilteredOut,
            fixedDoseInterventionFilteredIn, fixedDoseInterventionFilteredOut, titratedDoseInterventionFilteredIn, titratedDoseInterventionFilteredOut,
            bothDoseTypesInterventionFilteredIn, bothDoseTypesInterventionFilteredOut, combinationInterventionFilteredIn,
            combinationInterventionFilteredOut, interventionSetFilteredIn, interventionSetFilteredOut);
    SemanticInterventionUriAndName semanticIntervention = new SemanticInterventionUriAndName(semanticInterventionUri, "something");
    List<SemanticInterventionUriAndName> semanticInterventions = Collections.singletonList(semanticIntervention);
    when(interventionRepository.query(projectId)).thenReturn(sourceInterventions);
    when(triplestoreService.getInterventions(datasetUuid, headVersion)).thenReturn(semanticInterventions);
    List<URI> unitUris = Collections.singletonList(gramUri);
    when(triplestoreService.getUnitUris(datasetUuid, headVersion)).thenReturn(unitUris);

    AbstractInterventionCommand simpleCommand = InterventionService.buildSingleInterventionCommand(newProjectId, simpleInterventionFilteredIn);
    AbstractInterventionCommand fixedCommand = InterventionService.buildSingleInterventionCommand(newProjectId, fixedDoseInterventionFilteredIn);
    AbstractInterventionCommand titratedCommand = InterventionService.buildSingleInterventionCommand(newProjectId, titratedDoseInterventionFilteredIn);
    AbstractInterventionCommand bothTypesCommand = InterventionService.buildSingleInterventionCommand(newProjectId, bothDoseTypesInterventionFilteredIn);
    mockCreateSingleIntervention(simpleInterventionFilteredIn, SimpleIntervention.class, simpleCommand);
    mockCreateSingleIntervention(fixedDoseInterventionFilteredIn, FixedDoseIntervention.class, fixedCommand);
    mockCreateSingleIntervention(titratedDoseInterventionFilteredIn, TitratedDoseIntervention.class, titratedCommand);
    mockCreateSingleIntervention(bothDoseTypesInterventionFilteredIn, BothDoseTypesIntervention.class, bothTypesCommand);
    AbstractInterventionCommand combiCommand = new CombinationInterventionCommand(newProjectId, combinationInterventionFilteredIn.getName(),
            combinationInterventionFilteredIn.getMotivation(), Sets.newHashSet(-simpleInterventionFilteredIn.getId(), -fixedDoseInterventionFilteredIn.getId()));
    CombinationIntervention newCombination = mock(CombinationIntervention.class);
    when(newCombination.getId()).thenReturn(-combinationInterventionFilteredIn.getId());
    when(interventionRepository.create(account, combiCommand)).thenReturn(newCombination);
    AbstractInterventionCommand setCommand = new InterventionSetCommand(newProjectId, interventionSetFilteredIn.getName(),
            interventionSetFilteredIn.getMotivation(), Sets.newHashSet(-combinationInterventionFilteredIn.getId(), -titratedDoseInterventionFilteredIn.getId()));
    InterventionSet newSet = mock(InterventionSet.class);
    when(newSet.getId()).thenReturn(-combinationInterventionFilteredIn.getId());
    when(interventionRepository.create(account, setCommand)).thenReturn(newSet);

    // analyses
    Integer nmaId1 = 42;
    List<ArmExclusion> nmaExcludedArms = Collections.singletonList(new ArmExclusion(nmaId1, URI.create("http://anything.Groningen")));
    List<InterventionInclusion> nmaInterventionInclusions1 = Collections.singletonList(new InterventionInclusion(nmaId1, fixedDoseInterventionFilteredIn.getId()));
    List<CovariateInclusion> nmaIncludedCovariates1 = Collections.singletonList(new CovariateInclusion(nmaId1, covariateFilteredIn.getId()));
    AbstractAnalysis nma1 = new NetworkMetaAnalysis(nmaId1, projectId, "nma1", nmaExcludedArms, nmaInterventionInclusions1, nmaIncludedCovariates1, outcomeFilteredIn);
    AnalysisCommand nmaCommand1 = new AnalysisCommand(newProjectId, nma1.getTitle(), AnalysisType.EVIDENCE_SYNTHESIS);
    NetworkMetaAnalysis newNma1 = new NetworkMetaAnalysis(nmaId1 + 1, projectId, "nma1",
            Collections.emptyList(), Collections.emptyList(), Collections.emptyList(), outcomeFilteredIn);
    when(analysisService.createNetworkMetaAnalysis(account, nmaCommand1)).thenReturn(newNma1);

    Integer nmaId2 = 1337;
    List<InterventionInclusion> nmaInterventionInclusions2 = Collections.singletonList(new InterventionInclusion(nmaId2, titratedDoseInterventionFilteredIn.getId()));
    AbstractAnalysis nma2 = new NetworkMetaAnalysis(nmaId2, projectId, "nma2", Collections.emptyList(), nmaInterventionInclusions2, Collections.emptyList(), outcomeFilteredOut);
    AnalysisCommand nmaCommand2 = new AnalysisCommand(newProjectId, nma2.getTitle(), AnalysisType.EVIDENCE_SYNTHESIS);
    NetworkMetaAnalysis newNma2 = new NetworkMetaAnalysis(nmaId2 + 1, projectId, "nma2",
            Collections.emptyList(), Collections.emptyList(), Collections.emptyList(), outcomeFilteredIn);
    when(analysisService.createNetworkMetaAnalysis(account, nmaCommand2)).thenReturn(newNma2);

    List<AbstractAnalysis> sourceAnalyses = Arrays.asList(nma1, nma2);
    when(analysisRepository.query(projectId)).thenReturn(sourceAnalyses);
    when(outcomeRepository.get(outcomeFilteredIn.getId())).thenReturn(outcomeFilteredIn);

    //models
    Integer modelId1 = 1414;
    Integer modelId2 = 1515;
    Model model1 = new Model.ModelBuilder(nmaId1, "model 1")
            .id(modelId1)
            .link("identity")
            .modelType(Model.NETWORK_MODEL_TYPE)
            .build();
    Model model2 = new Model.ModelBuilder(nmaId1, "model 2")
            .id(modelId2)
            .link("identity")
            .modelType(Model.PAIRWISE_MODEL_TYPE)
            .from(new Model.DetailNode(titratedDoseInterventionFilteredIn.getId(), "titrated"))
            .to(new Model.DetailNode(fixedDoseInterventionFilteredIn.getId(), "fixed"))
            .build();

    when(modelRepository.findModelsByProject(projectId)).thenReturn(Arrays.asList(model1, model2));

    when(analysisRepository.get(newNma1.getId())).thenReturn(newNma1);
    when(analysisRepository.get(model1.getAnalysisId())).thenReturn(nma1);
    AbstractProblemEntry newEntry1 = new AbsoluteContinuousProblemEntry("study", 1, 1234, 6., 0.4);
    AbstractProblemEntry oldEntry1 = new AbsoluteContinuousProblemEntry("study", 1, 12, 3., 0.2);
    List<AbstractProblemEntry> newEntries1 = Collections.singletonList(newEntry1);
    List<AbstractProblemEntry> oldEntries1 = Collections.singletonList(oldEntry1);
    AbstractProblem newProblem1 = new NetworkMetaAnalysisProblem(newEntries1, null, null);
    AbstractProblem oldProblem1 = new NetworkMetaAnalysisProblem(oldEntries1, null, null);
    when(mockNewProject.getId()).thenReturn(newProjectId);
    when(mockProject.getId()).thenReturn(projectId);
    when(problemService.getProblem(newProjectId, newNma1.getId())).thenReturn(newProblem1);
    when(problemService.getProblem(projectId, nma1.getId())).thenReturn(oldProblem1);

    when(mockNewProject.getId()).thenReturn(newProjectId);

    /// *8888888888**************************** GO *********************888888888888888* ///
    projectService.createUpdated(account, projectId);
    /// *8888888888**************************** GO *********************888888888888888* ///

    verify(outcomeRepository).query(projectId);
    verify(outcomeRepository).create(account, newProjectId, outcomeFilteredIn.getName(), outcomeFilteredIn.getDirection(), outcomeFilteredIn.getMotivation(),
            outcomeFilteredIn.getSemanticVariable());
    verify(outcomeRepository).get(newMockOutcome.getId());
    verifyNoMoreInteractions(outcomeRepository);

    verify(covariateRepository).findByProject(projectId);
    verify(covariateRepository).createForProject(newProjectId, covariateFilteredInUri.toString(), covariateFilteredIn.getName(),
            covariateFilteredIn.getMotivation(), CovariateOptionType.POPULATION_CHARACTERISTIC);
    verify(covariateRepository).createForProject(newProjectId, covariateStudyLevel.getDefinitionKey(), covariateStudyLevel.getName(),
            covariateStudyLevel.getMotivation(), CovariateOptionType.STUDY_CHARACTERISTIC);
    verifyNoMoreInteractions(covariateRepository);
    verify(scaledUnitRepository).query(projectId);

    verify(interventionRepository).query(projectId);
    verify(interventionRepository).create(account, simpleCommand);
    verify(interventionRepository).create(account, fixedCommand);
    verify(interventionRepository).create(account, titratedCommand);
    verify(interventionRepository).create(account, bothTypesCommand);
    verify(interventionRepository).create(account, combiCommand);
    verify(interventionRepository).create(account, setCommand);
    verifyNoMoreInteractions(interventionRepository);

    verify(triplestoreService).getHeadVersion(mapping.getVersionedDatasetUri());
    verify(triplestoreService).getOutcomes(datasetUuid, headVersion);
    verify(triplestoreService).getPopulationCharacteristics(datasetUuid, headVersion);
    verify(triplestoreService).getUnitUris(datasetUuid, headVersion);
    verify(triplestoreService).getInterventions(datasetUuid, headVersion);
    verifyNoMoreInteractions(triplestoreService);

    verify(analysisRepository).query(projectId);
    verify(analysisRepository, times(2)).get(newNma1.getId());
    verify(analysisRepository, times(2)).get(model1.getAnalysisId());
    verify(analysisRepository).query(newProjectId);
    verifyNoMoreInteractions(analysisRepository);

    verify(analysisService).createNetworkMetaAnalysis(account, nmaCommand1);
    verify(analysisService).buildEvidenceTable(newProjectId, nmaId1);
    verifyNoMoreInteractions(analysisService);

    verify(modelRepository).findModelsByProject(projectId);
    verifyNoMoreInteractions(modelRepository);

    verify(problemService, times(2)).getProblem(newProjectId, newNma1.getId());
    verify(problemService, times(2)).getProblem(projectId, nma1.getId());
    verifyNoMoreInteractions(problemService);
  }

  private void mockCreateSingleIntervention(SingleIntervention intervention, Class<? extends SingleIntervention> classToMock, AbstractInterventionCommand command) throws InvalidConstraintException, MethodNotAllowedException, ResourceDoesNotExistException {
    AbstractIntervention newFixedIn = mock(classToMock);
    when(newFixedIn.getId()).thenReturn(-intervention.getId());
    when(interventionRepository.create(account, command)).thenReturn(newFixedIn);
  }
}
