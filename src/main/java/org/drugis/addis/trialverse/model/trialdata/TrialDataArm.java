package org.drugis.addis.trialverse.model.trialdata;

import java.net.URI;
import java.util.*;

public class TrialDataArm {
  private URI uri;
  private String name;
  private Map<URI, Set<Measurement>> measurements = new HashMap<>();
  private List<AbstractSemanticIntervention> semanticInterventions = new ArrayList<>();

  private Set<Integer> matchedProjectInterventionIds = new HashSet<>();

  public TrialDataArm() {
  }

  public TrialDataArm(URI uri, String name) {
    this.uri = uri;
    this.name = name;
  }

  public URI getUri() {
    return uri;
  }

  public String getName() {
    return name;
  }

  public Map<URI, Set<Measurement>> getMeasurements() {
    return measurements;
  }

  public Set<Measurement> getMeasurementsForMoment(URI measurementMomentUri) {
    return measurements.isEmpty() ? Collections.emptySet() : measurements.get(measurementMomentUri);
  }

  public void addMeasurement(URI measurementMomentUri, Measurement measurement) {
    if(measurements.get(measurementMomentUri) == null){
      this.measurements.put(measurementMomentUri,new HashSet<>());
    }
    this.measurements.get(measurementMomentUri).add(measurement);
  }

  public void addSemanticIntervention(AbstractSemanticIntervention abstractSemanticIntervention) {
    this.semanticInterventions.add(abstractSemanticIntervention);
  }

  public List<AbstractSemanticIntervention> getSemanticInterventions() {
    return semanticInterventions;
  }

  public Set<Integer> getMatchedProjectInterventionIds() {
    return matchedProjectInterventionIds;
  }

  public void setMatchedProjectInterventionIds(Set<Integer> matchedProjectInterventionId) {
    this.matchedProjectInterventionIds = matchedProjectInterventionId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    TrialDataArm that = (TrialDataArm) o;
    return Objects.equals(uri, that.uri) &&
            Objects.equals(name, that.name) &&
            Objects.equals(measurements, that.measurements) &&
            Objects.equals(semanticInterventions, that.semanticInterventions) &&
            Objects.equals(matchedProjectInterventionIds, that.matchedProjectInterventionIds);
  }

  @Override
  public int hashCode() {

    return Objects.hash(uri, name, measurements, semanticInterventions, matchedProjectInterventionIds);
  }
}
