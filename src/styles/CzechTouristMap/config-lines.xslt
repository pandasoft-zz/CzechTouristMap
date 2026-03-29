<?xml-stylesheet type="text/xsl"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://mapsforge.org/renderTheme" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<!-- 
# OpenHikingMap
#
# Line configuration
#
# Copyright (c) 2022-2025 OpenHiking contributors
# SPDX-License-Identifier: GPL-3.0-only
-->

<xsl:variable name="zm-level2">14</xsl:variable>
<xsl:variable name="zm-level3">16</xsl:variable>
<xsl:variable name="zm-level4">18</xsl:variable>

<xsl:variable name="zm-motorway">8</xsl:variable>
<xsl:variable name="zm-motorway_link">12</xsl:variable>
<xsl:variable name="zm-trunk">8</xsl:variable>
<xsl:variable name="zm-trunk_link">12</xsl:variable>
<xsl:variable name="zm-primary">8</xsl:variable>
<xsl:variable name="zm-secondary">9</xsl:variable>
<xsl:variable name="zm-tertiary">10</xsl:variable>
<xsl:variable name="zm-unclassified">11</xsl:variable>
<xsl:variable name="zm-residential">11</xsl:variable>
<xsl:variable name="zm-pedestrian">13</xsl:variable>
<xsl:variable name="zm-living">12</xsl:variable>
<xsl:variable name="zm-service">13</xsl:variable>
<xsl:variable name="zm-raceway">14</xsl:variable>
<xsl:variable name="zm-macadam">11</xsl:variable>
<xsl:variable name="zm-track">13</xsl:variable>
<xsl:variable name="zm-track2">16</xsl:variable>
<xsl:variable name="zm-cycleway">13</xsl:variable>
<xsl:variable name="zm-footway">14</xsl:variable>
<xsl:variable name="zm-bridleway">14</xsl:variable>
<xsl:variable name="zm-path">13</xsl:variable>
<xsl:variable name="zm-path2">16</xsl:variable>
<xsl:variable name="zm-steps">15</xsl:variable>
<xsl:variable name="zm-ferrata">15</xsl:variable>

<xsl:variable name="zm-ferry">12</xsl:variable>

<!-- 
<xsl:variable name="zm-level2">15</xsl:variable>
<xsl:variable name="zm-level3">17</xsl:variable>
<xsl:variable name="zm-level4">19</xsl:variable>

-->


<xsl:variable name="lw-trail-highlight-low">2.6</xsl:variable>
<xsl:variable name="lw-trail-highlight">1.2</xsl:variable>
<xsl:variable name="lw-trail-highlight-deep">0.5</xsl:variable>
<xsl:variable name="lw-trail-highlight-l2">0.9</xsl:variable>
<xsl:variable name="lw-trail-highlight-l3">0.6</xsl:variable>
<xsl:variable name="lw-trail-highlight-l4">0.35</xsl:variable>


<xsl:variable name="lw-motorway">2.8</xsl:variable>
<xsl:variable name="lw-motorway_link">1.6</xsl:variable>
<xsl:variable name="lw-trunk">2.8</xsl:variable>
<xsl:variable name="lw-trunk_link">1.6</xsl:variable>
<xsl:variable name="lw-primary">3.0</xsl:variable>
<xsl:variable name="lw-secondary">2.8</xsl:variable>
<xsl:variable name="lw-tertiary">2.5</xsl:variable>
<xsl:variable name="lw-residential">2.0</xsl:variable>
<xsl:variable name="lw-residential2">1.8</xsl:variable>
<xsl:variable name="lw-residential3">1.6</xsl:variable>
<xsl:variable name="lw-living_street">1.3</xsl:variable>
<xsl:variable name="lw-unclassified">2.5</xsl:variable>
<xsl:variable name="lw-unclassified2">1.8</xsl:variable>
<xsl:variable name="lw-unclassified3">1.6</xsl:variable>
<xsl:variable name="lw-service">2.2</xsl:variable>
<xsl:variable name="lw-service2">1.2</xsl:variable>
<xsl:variable name="lw-cycleway">1.2</xsl:variable>
<xsl:variable name="lw-raceway">0.6</xsl:variable>
<xsl:variable name="lw-macadam">2.5</xsl:variable>
<xsl:variable name="lw-macadam2">1.5</xsl:variable>
<xsl:variable name="lw-track">0.65</xsl:variable>
<xsl:variable name="lw-track2">0.5</xsl:variable>
<xsl:variable name="lw-track3">0.3</xsl:variable>
<xsl:variable name="lw-pedestrian">0.4</xsl:variable>
<xsl:variable name="lw-footway">0.2</xsl:variable>
<xsl:variable name="lw-bridleway">0.4</xsl:variable>
<xsl:variable name="lw-path">0.65</xsl:variable>
<xsl:variable name="lw-path2">0.5</xsl:variable>
<xsl:variable name="lw-path3">0.3</xsl:variable>
<xsl:variable name="lw-path4">0.25</xsl:variable>
<xsl:variable name="lw-steps">0.6</xsl:variable>
<xsl:variable name="lw-ferrata">0.8</xsl:variable>


<xsl:variable name="lw-tunnel">0.2</xsl:variable>
<xsl:variable name="lw-embankment">0.1</xsl:variable>
<xsl:variable name="lw-embankment2">1</xsl:variable>

<xsl:variable name="lw-ferry">0.5</xsl:variable>
<xsl:variable name="lw-pier">0.5</xsl:variable>
<xsl:variable name="lw-rail">0.8</xsl:variable>
<xsl:variable name="lw-rail-narrow">0.45</xsl:variable>

<xsl:variable name="lw-restricted">1.5</xsl:variable>

<xsl:variable name="lw-national-park-1">1.4</xsl:variable>
<xsl:variable name="lw-national-park-1-wide">5</xsl:variable>
<xsl:variable name="lw-national-park-2">1.2</xsl:variable>
<xsl:variable name="lw-national-park-2-wide">8</xsl:variable>
<xsl:variable name="lw-national-park-3">1.0</xsl:variable>
<xsl:variable name="lw-national-park-3-wide">6</xsl:variable>
<xsl:variable name="lw-national-park-4">0.8</xsl:variable>
<xsl:variable name="lw-national-park-4-wide">5</xsl:variable>

<xsl:variable name="lw-protected-area-1">0.8</xsl:variable>
<xsl:variable name="lw-protected-area-1-wide">5</xsl:variable>
<xsl:variable name="lw-protected-area-2">0.6</xsl:variable>
<xsl:variable name="lw-protected-area-2-wide">3</xsl:variable>
<xsl:variable name="lw-protected-area-3">0.4</xsl:variable>
<xsl:variable name="lw-protected-area-3-wide">2.5</xsl:variable>
<xsl:variable name="lw-protected-area-4">0.2</xsl:variable>
<xsl:variable name="lw-protected-area-4-wide">2</xsl:variable>

<xsl:variable name="lw-protected-strictly-2">0.6</xsl:variable>
<xsl:variable name="lw-protected-strictly-2-wide">3</xsl:variable>
<xsl:variable name="lw-protected-strictly-3">0.4</xsl:variable>
<xsl:variable name="lw-protected-strictly-3-wide">2.5</xsl:variable>
<xsl:variable name="lw-protected-strictly-4">0.2</xsl:variable>
<xsl:variable name="lw-protected-strictly-4-wide">2</xsl:variable>

<!-- Road border/outline colors — SM5/guideline: dark gray casing -->
<xsl:variable name="bc-motorway">#444444</xsl:variable>
<xsl:variable name="bc-motorway_link">#444444</xsl:variable>
<xsl:variable name="bc-trunk">#444444</xsl:variable>
<xsl:variable name="bc-trunk_link">#555555</xsl:variable>
<xsl:variable name="bc-primary">#555555</xsl:variable>
<xsl:variable name="bc-secondary">#666666</xsl:variable>
<xsl:variable name="bc-tertiary">#777777</xsl:variable>
<xsl:variable name="bc-unclassified">#888888</xsl:variable>
<xsl:variable name="bc-residential">#888888</xsl:variable>
<xsl:variable name="bc-living">#888888</xsl:variable>
<xsl:variable name="bc-service">#888888</xsl:variable>
<xsl:variable name="bc-cycleway">#0040A0</xsl:variable>
<xsl:variable name="bc-macadam">#707070</xsl:variable>
<xsl:variable name="bc-tunnel">#707070</xsl:variable>


<!-- Road fill colors — SM5/guideline: yellow hierarchy -->
<!-- Dálnice: #FFFF99 | Silnice I: #FFCC66 | Silnice II: #FFEE99 | Silnice III+: #FFFFFF -->
<xsl:variable name="lc-motorway">#FFFF99</xsl:variable>
<xsl:variable name="lc-motorway_link">#FFFF99</xsl:variable>
<xsl:variable name="lc-trunk">#FFFF99</xsl:variable>
<xsl:variable name="lc-trunk_link">#FFCC66</xsl:variable>
<xsl:variable name="lc-primary">#FFCC66</xsl:variable>
<xsl:variable name="lc-secondary">#FFEE99</xsl:variable>
<xsl:variable name="lc-tertiary">#FFFFFF</xsl:variable>
<xsl:variable name="lc-4wd-road">#C8A060</xsl:variable>
<xsl:variable name="lc-unclassified">#FFFFFF</xsl:variable>
<xsl:variable name="lc-residential">#FFFFFF</xsl:variable>
<xsl:variable name="lc-living">#FFFFFF</xsl:variable>
<xsl:variable name="lc-service">#FFFFFF</xsl:variable>
<xsl:variable name="lc-cycleway">#FFFFFF</xsl:variable>
<xsl:variable name="lc-raceway">#909090</xsl:variable>
<xsl:variable name="lc-macadam">#FFFFFF</xsl:variable>
<!-- Field/forest tracks and paths — warm brown per Czech cartographic convention -->
<xsl:variable name="lc-track">#8C5A1E</xsl:variable>
<xsl:variable name="lc-pedestrian">#707070</xsl:variable>
<xsl:variable name="lc-footway">#606060</xsl:variable>
<xsl:variable name="lc-bridleway">#8C5A1E</xsl:variable>
<xsl:variable name="lc-path">#8C5A1E</xsl:variable>
<xsl:variable name="lc-mountain-path">#6A4010</xsl:variable>
<xsl:variable name="lc-alpine-path">#404040</xsl:variable>
<xsl:variable name="lc-steps">#A02030</xsl:variable>
<xsl:variable name="lc-ferrata">#C00000</xsl:variable>

<!-- Tunnel fill — desaturated versions of road colors -->
<xsl:variable name="lc-motorway-tunnel">#FFFFC0</xsl:variable>
<xsl:variable name="lc-motorway_link-tunnel">#FFFFC0</xsl:variable>
<xsl:variable name="lc-trunk-tunnel">#FFFFC0</xsl:variable>
<xsl:variable name="lc-trunk_link-tunnel">#FFE0A0</xsl:variable>
<xsl:variable name="lc-primary-tunnel">#FFE0A0</xsl:variable>
<xsl:variable name="lc-secondary-tunnel">#FFF4C0</xsl:variable>
<xsl:variable name="lc-tertiary-tunnel">#F0F0F0</xsl:variable>
<xsl:variable name="lc-unclassified-tunnel">#E8E8E8</xsl:variable>
<xsl:variable name="lc-residential-tunnel">#E8E8E8</xsl:variable>
<xsl:variable name="lc-living-tunnel">#E8E8E8</xsl:variable>
<xsl:variable name="lc-service-tunnel">#E8E8E8</xsl:variable>
<xsl:variable name="lc-tunnel">#E8E8E8</xsl:variable>
<xsl:variable name="lc-embankment">#A09080</xsl:variable>

<xsl:variable name="lc-restricted">#CC0000</xsl:variable>

<xsl:variable name="da-highlight-l0">6,9</xsl:variable>
<xsl:variable name="da-highlight-l1">8,12</xsl:variable>
<xsl:variable name="da-highlight-l2">10,15</xsl:variable>
<xsl:variable name="da-highlight-l3">16,24</xsl:variable>
<xsl:variable name="da-highlight-l4">22,33</xsl:variable>

<xsl:variable name="da-tunnel">16,16</xsl:variable>
<xsl:variable name="da-embankment">0.1,2</xsl:variable>
<xsl:variable name="da-restricted">0.08,1.8</xsl:variable>

</xsl:stylesheet>