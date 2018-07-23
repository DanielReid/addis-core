package org.drugis.addis.models.service;

import org.drugis.addis.analyses.model.AbstractAnalysis;
import org.drugis.addis.analyses.model.NetworkMetaAnalysis;
import org.drugis.addis.analyses.repository.AnalysisRepository;
import org.drugis.addis.exception.ProblemCreationException;
import org.drugis.addis.exception.ResourceDoesNotExistException;
import org.drugis.addis.interventions.service.impl.InvalidTypeForDoseCheckException;
import org.drugis.addis.models.Model;
import org.drugis.addis.outcomes.Outcome;
import org.drugis.addis.patavitask.PataviTaskUriHolder;
import org.drugis.addis.patavitask.repository.PataviTaskRepository;
import org.drugis.addis.patavitask.service.PataviTaskService;
import org.drugis.addis.patavitask.service.impl.PataviTaskServiceImpl;
import org.drugis.addis.problems.model.NetworkMetaAnalysisProblem;
import org.drugis.addis.problems.service.ProblemService;
import org.drugis.addis.trialverse.model.SemanticVariable;
import org.drugis.addis.trialverse.service.TriplestoreService;
import org.drugis.addis.trialverse.service.impl.ReadValueException;
import org.drugis.addis.util.WebConstants;
import org.json.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.net.URI;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;

;

public class PataviTaskServiceTest {
  @Mock
  private TriplestoreService triplestoreService;

  @Mock
  private ProblemService problemService;

  @Mock
  private ModelService modelService;

  @Mock
  private AnalysisRepository analysisRepository;

  @Mock
  private PataviTaskRepository pataviTaskRepository;

  @Mock
  private WebConstants webConstants;

  @InjectMocks
  private PataviTaskService pataviTaskService;


  @Before
  public void setUp() throws ResourceDoesNotExistException {
    pataviTaskService = new PataviTaskServiceImpl();
    initMocks(this);
    reset(modelService, pataviTaskRepository, problemService);
  }

  @After
  public void cleanUp() {
    verifyNoMoreInteractions(modelService, pataviTaskRepository);
  }

  @Test
  public void testFindTaskWhenThereIsNoTask() throws Exception, ReadValueException, InvalidTypeForDoseCheckException, ProblemCreationException {
    Integer modelId = -2;
    String problem = "Yo";
    Integer projectId = -6;
    Integer analysisId = -7;
    String modelTitle = "modelTitle";
    Integer outcomeDirection = 1;
    URI pataviGemtcUri = URI.create("patavi");
    AbstractAnalysis nma = new NetworkMetaAnalysis(analysisId, projectId, "title", new Outcome(1, projectId, "name", outcomeDirection, null, new SemanticVariable(URI.create("uri"), "label")));

    Model model = new Model.ModelBuilder(analysisId, modelTitle)
            .modelType(Model.NETWORK_MODEL_TYPE)
            .link(Model.LINK_LOG)
            .build();
    NetworkMetaAnalysisProblem networkMetaAnalysisProblem = mock(NetworkMetaAnalysisProblem.class);
    when(networkMetaAnalysisProblem.toString()).thenReturn(problem);
    when(problemService.getProblem(projectId, analysisId)).thenReturn(networkMetaAnalysisProblem);
    when(modelService.find(modelId)).thenReturn(model);
    when(webConstants.getPataviGemtcUri()).thenReturn(pataviGemtcUri);
    URI createdURI = URI.create("new.task.com");
    when(analysisRepository.get(analysisId)).thenReturn(nma);
    when(pataviTaskRepository.createPataviTask(pataviGemtcUri, networkMetaAnalysisProblem.buildProblemWithModelSettings(model, outcomeDirection))).thenReturn(createdURI);
    when(problemService.applyModelSettings(networkMetaAnalysisProblem, model)).thenReturn(networkMetaAnalysisProblem);
    PataviTaskUriHolder result = pataviTaskService.getGemtcPataviTaskUriHolder(projectId, analysisId, modelId);

    assertNotNull(result.getUri());
    verify(analysisRepository).get(analysisId);
    verify(modelService).find(modelId);
    verify(problemService).getProblem(projectId, analysisId);
    verify(problemService).applyModelSettings(networkMetaAnalysisProblem, model);
    verify(pataviTaskRepository).createPataviTask(pataviGemtcUri, networkMetaAnalysisProblem.buildProblemWithModelSettings(model, outcomeDirection));
  }

  @Test
  public void testFindTaskWhenThereAlreadyIsATask() throws Exception, ReadValueException, InvalidTypeForDoseCheckException, ProblemCreationException {
    Integer modelId = -2;
    Integer projectId = -6;
    Integer analysisId = -7;
    String modelTitle = "modelTitle";
    String linearModel = Model.LINEAR_MODEL_FIXED;
    Integer burnInIterations = 5000;
    Integer inferenceIterations = 20000;
    Integer thinningFactor = 10;
    String likelihood = Model.LIKELIHOOD_BINOM;
    String link = Model.LINK_LOG;
    Integer outcomeDirection = 1;

    AbstractAnalysis nma = new NetworkMetaAnalysis(analysisId, projectId, "title", new Outcome(1, projectId, "name", outcomeDirection, null, new SemanticVariable(URI.create("uri"), "label")));
    when(analysisRepository.get(analysisId)).thenReturn(nma);

    Model model = new Model.ModelBuilder(analysisId, modelTitle)
            .id(modelId)
            .taskUri(URI.create("-7"))
            .linearModel(linearModel)
            .modelType(Model.NETWORK_MODEL_TYPE)
            .burnInIterations(burnInIterations)
            .inferenceIterations(inferenceIterations)
            .thinningFactor(thinningFactor)
            .likelihood(likelihood)
            .link(link)
            .build();
    when(modelService.find(modelId)).thenReturn(model);

    PataviTaskUriHolder result = pataviTaskService.getGemtcPataviTaskUriHolder(projectId, analysisId, modelId);
    assertNotNull(result.getUri());
    verify(analysisRepository).get(analysisId);
    verify(modelService).find(modelId);
  }

  @Test(expected = ResourceDoesNotExistException.class)
  public void testFindTaskForInvalidModel() throws Exception, ReadValueException, InvalidTypeForDoseCheckException, ProblemCreationException {
    Integer projectId = -6;
    Integer analysisId = -7;
    Integer invalidModelId = -2;
    Integer outcomeDirection = 1;
    AbstractAnalysis nma = new NetworkMetaAnalysis(analysisId, projectId, "title", new Outcome(1, projectId, "name", outcomeDirection, null, new SemanticVariable(URI.create("uri"), "label")));
    when(analysisRepository.get(analysisId)).thenReturn(nma);
    when(modelService.find(invalidModelId)).thenReturn(null);
    try {
      pataviTaskService.getGemtcPataviTaskUriHolder(projectId, analysisId, invalidModelId);
    } finally {
      verify(modelService).find(invalidModelId);
    }
  }

  @Test
  public void testGetMcdaTask() {
    URI mcdaPataviUri = URI.create("problem");
    URI createdUri = URI.create("created");
    JSONObject problem = new JSONObject();

    when(pataviTaskRepository.createPataviTask(mcdaPataviUri, problem)).thenReturn(createdUri);
    when(webConstants.getPataviMcdaUri()).thenReturn(mcdaPataviUri);

    PataviTaskUriHolder mcdaPataviTaskUriHolder = pataviTaskService.getMcdaPataviTaskUriHolder(problem);

    assertEquals(createdUri, mcdaPataviTaskUriHolder.getUri());
    verify(pataviTaskRepository).createPataviTask(mcdaPataviUri, problem);
  }

}
