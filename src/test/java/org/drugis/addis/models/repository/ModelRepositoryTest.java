package org.drugis.addis.models.repository;

import com.google.common.collect.Sets;
import net.minidev.json.JSONObject;
import org.apache.commons.lang3.tuple.Pair;
import org.drugis.addis.analyses.model.NetworkMetaAnalysis;
import org.drugis.addis.config.JpaRepositoryTestConfig;
import org.drugis.addis.models.Model;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.dao.DataAccessException;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.*;

@RunWith(SpringJUnit4ClassRunner.class)
@Transactional
@ContextConfiguration(classes = {JpaRepositoryTestConfig.class})
public class ModelRepositoryTest {

  @PersistenceContext(unitName = "addisCore")
  EntityManager em;

  @Inject
  private ModelRepository modelRepository;

  @Test
  public void testCreate() throws Exception {
    Integer analysisId = -5;
    String modelTitle = "model title";
    String linearModel = "fixed";
    Integer burnInIterations = 5000;
    Integer inferenceIterations = 20000;
    Integer thinningFactor = 10;
    String likelihood = Model.LIKELIHOOD_BINOM;
    String link = Model.LINK_LOG;
    JSONObject regressor = new JSONObject();
    regressor.put("a", "b");
    Model toPersist = new Model.ModelBuilder(analysisId, modelTitle)
            .linearModel(linearModel)
            .modelType(Model.NETWORK_MODEL_TYPE)
            .burnInIterations(burnInIterations)
            .inferenceIterations(inferenceIterations)
            .thinningFactor(thinningFactor)
            .likelihood(likelihood)
            .link(link)
            .regressor(regressor)
            .build();
    Model model = modelRepository.persist(toPersist);
    assertEquals(analysisId, model.getAnalysisId());
    assertNotNull(model.getId());
    assertEquals("fixed", model.getLinearModel());
    assertEquals(Model.NETWORK_MODEL_TYPE, model.getModelTypeTypeAsString());
    assertNull(model.getHeterogeneityPrior());
    assertEquals(burnInIterations, model.getBurnInIterations());
    assertEquals(inferenceIterations, model.getInferenceIterations());
    assertEquals(thinningFactor, model.getThinningFactor());
    assertEquals(likelihood, model.getLikelihood());
    assertEquals(link, model.getLink());
    assertNull(model.getPairwiseDetails());
    assertEquals(regressor, model.getRegressor());
  }

  @Test
  public void testFind() throws IOException {
    Integer analysisId = -5;
    Integer modelId = 1;
    Model result = modelRepository.find(modelId);
    assertNotNull(result);
    assertEquals(analysisId, result.getAnalysisId());
  }

  @Test
  public void getPairwiseTypeModel() throws IOException {
    Integer analysisId = -5;
    Integer modelId = 2;
    Double mean = 2.3;
    Double stdDev = 0.3;
    Model result = modelRepository.find(modelId);
    assertNotNull(result);
    assertEquals(analysisId, result.getAnalysisId());
    assertNotNull(result.getId());
    assertEquals("fixed", result.getLinearModel());
    assertEquals(Model.PAIRWISE_MODEL_TYPE, result.getModelTypeTypeAsString());
    assertNotNull(result.getPairwiseDetails());
    Pair<Model.DetailNode, Model.DetailNode> details = result.getPairwiseDetails();
    assertEquals("study2", details.getLeft().getName());
    assertEquals("study1", details.getRight().getName());
    assertEquals(Model.VARIANCE_HETEROGENEITY_PRIOR_TYPE, result.getHeterogeneityPrior().getType());
    Model.HeterogeneityVarianceValues values = (Model.HeterogeneityVarianceValues) result.getHeterogeneityPrior().getValues();
    assertEquals(mean, values.getMean());
    assertEquals(stdDev, values.getStdDev());
  }

  @Test
  public void testFindByAnalysis() throws SQLException {
    Integer analysisId = -5;
    NetworkMetaAnalysis networkMetaAnalysisWithModel = em.find(NetworkMetaAnalysis.class, analysisId);
    List<Model> models = modelRepository.findByAnalysis(networkMetaAnalysisWithModel.getId());
    assertNotNull(models);
    assertEquals(2, models.size());
    assertEquals(networkMetaAnalysisWithModel.getId(), models.get(0).getAnalysisId());
    assertNull(models.get(1).getRunStatus());

    Integer analysisIdWithoutModel = -6;
    NetworkMetaAnalysis networkMetaAnalysisWithWithOutModel = em.find(NetworkMetaAnalysis.class, analysisIdWithoutModel);
    models = modelRepository.findByAnalysis(networkMetaAnalysisWithWithOutModel.getId());
    assertTrue(models.isEmpty());
  }

  @Test
  public void testFindByAnalysisWithTask() throws SQLException {
    Integer analysisId = -7;
    NetworkMetaAnalysis nmaTaskTest = em.find(NetworkMetaAnalysis.class, analysisId);

    List<Model> models = modelRepository.findByAnalysis(nmaTaskTest.getId());

    assertNotNull(models);
    assertEquals(2, models.size());
  }

  @Test
  public void testGet() throws IOException {
    Integer modelId = 1;
    Model result = modelRepository.get(modelId);
    assertNotNull(result);
  }

  @Test
  public void testGetByModelIds() {
    Set<Integer> modelIds = Sets.newHashSet(1, 2);
    List<Model> result = modelRepository.get(modelIds);
    assertNotNull(result);
    assertEquals(2, result.size());
  }

  @Test
  public void testGetByModelIdsWithEmptyList() {
    Set<Integer> modelIds = Collections.emptySet();
    List<Model> result = modelRepository.get(modelIds);
    assertTrue(result.isEmpty());
  }

  @Test(expected = DataAccessException.class)
  public void testGetNonExistentModel() throws IOException {
    Integer modelId = -999;
    modelRepository.get(modelId);
  }

  @Test
  public void testFindByProject() throws Exception {
    Integer projectId = 1;
    List<Model> models = modelRepository.findModelsByProject(projectId);
    assertEquals(2, models.size());
  }

  @Test
  public void testFindNetworkModelsByProject() throws SQLException {
    Integer projectId = 2;
    List<Model> networkModelsByProject = modelRepository.findModelsByProject(projectId);
    assertEquals(2, networkModelsByProject.size());
  }

  @Test
  public void setArchived() throws IOException {
    Integer modelId = 1;
    Boolean archived = true;
    modelRepository.setArchived(modelId, archived);
    Model model = modelRepository.get(modelId);
    assertTrue(model.getArchived());
    assertNotNull(model.getArchivedOn());
  }

  @Test
  public void setArchiveToFalse() throws IOException {
    Integer modelId = 1;
    Boolean archived = false;
    modelRepository.setArchived(modelId, archived);
    Model model = modelRepository.get(modelId);
    assertFalse(model.getArchived());
    assertNull(model.getArchivedOn());
  }

  @Test
  public void testSetTitle() throws IOException {
    Integer modelId = 1;
    String title = "new title";
    modelRepository.setTitle(modelId, title);
    Model model = modelRepository.get(modelId);
    assertEquals(title, model.getTitle());
  }
}