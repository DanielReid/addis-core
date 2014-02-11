package org.drugis.addis.trialverse.controller;

/**
 * Created by daan on 2/11/14.
 */
public class Trialverse {
  private int id;
  private String namespace;

  public Trialverse(int id, String namespace) {
    this.id = id;
    this.namespace = namespace;
  }

  public Trialverse() {
  }

  public Trialverse(String namespace) {
    this(-1, namespace);
  }

  public int getId() {
    return id;
  }

  public void setId(int id) {
    this.id = id;
  }

  public String getNamespace() {
    return namespace;
  }

  public void setNamespace(String namespace) {
    this.namespace = namespace;
  }
}