package org.drugis.addis.trialverse;

import org.drugis.addis.config.JpaTrialverseRepositoryTestConfig;
import org.drugis.addis.exception.ResourceDoesNotExistException;
import org.drugis.addis.trialverse.model.Namespace;
import org.drugis.addis.trialverse.model.Study;
import org.drugis.addis.trialverse.model.Variable;
import org.drugis.addis.trialverse.repository.TrialverseRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

import static org.junit.Assert.*;
import static org.junit.Assert.assertEquals;

/**
 * Created by connor on 2/26/14.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {JpaTrialverseRepositoryTestConfig.class})
@Transactional
public class TrialverseRepositoryTest {
  @Inject
  private TrialverseRepository trialverseRepository;

  @PersistenceContext(unitName = "trialverse")
  EntityManager em;

  @Test
  public void testQuery() {
    Collection<Namespace> namespaces = trialverseRepository.query();
    assertEquals(3, namespaces.size());
  }

  @Test
  public void testGet() throws ResourceDoesNotExistException {
    Namespace namespace = trialverseRepository.get(1L);
    assertEquals(new Long(1), namespace.getId());
  }

  @Test
  public void testQueryStudy() {
    Long namespaceId = 1L;
    Long studyId = 1L;
    Study studyInNamespace = em.find(Study.class, studyId);
    List<Study> studyList = trialverseRepository.queryStudies(namespaceId);
    assertTrue(studyList.contains(studyInNamespace));
    assertEquals(3, studyList.size());
    Long studyId2 = 4L;
    Study studyNotInNamespace = em.find(Study.class, studyId2);
    assertFalse(studyList.contains(studyNotInNamespace));
  }

  @Test
  public void testGetArmNamesByDrugIds() {
    Integer studyId = 1;
    List<Integer> drugIds = Arrays.asList(1, 2, 3);
    List<String> result = trialverseRepository.getArmNamesByDrugIds(studyId, drugIds);
    assertFalse(result.isEmpty());
    assertEquals(2, result.size());
    assertTrue(result.contains("study 1 arm 1"));
  }

  @Test
  public void testGetVariableNamesByOutcomeIds() {
    Variable expected = em.find(Variable.class, 1L);
    List<Integer> outcomeIds = Arrays.asList(1, 2, 3);
    List<Variable> result = trialverseRepository.getVariablesByOutcomeIds(outcomeIds);
    assertFalse(result.isEmpty());
    assertEquals(2, result.size());
    assertTrue(result.contains(expected));
  }

}
