package org.drugis.addis.trialverse.repository;

import org.drugis.addis.exception.ResourceDoesNotExistException;
import org.drugis.addis.trialverse.model.Namespace;
import org.drugis.addis.trialverse.model.Study;

import java.util.Collection;
import java.util.List;

/**
 * Created by connor on 2/26/14.
 */
public interface TrialverseRepository {
  public Collection<Namespace> query();

  public Namespace get(Long trialverseId) throws ResourceDoesNotExistException;

  public List<Study> queryStudies(Long namespaceId);

  public List<String> getArmNamesByDrugIds(Integer studyId, List<Integer> drugIds);

  public List<String> getVariableNamesByOutcomeIds(Integer studyId, List<Integer> outcomeIds);
}
