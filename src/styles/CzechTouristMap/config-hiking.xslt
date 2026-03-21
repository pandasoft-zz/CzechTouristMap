<?xml-stylesheet type="text/xsl"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://mapsforge.org/renderTheme" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

<!-- 
# OpenHikingMap
#
# Hiking symbol config
#
# Copyright (c) 2022-2023 OpenHiking contributors
# SPDX-License-Identifier: GPL-3.0-only
-->

<xsl:variable name="symbol-tag">trail_symbol</xsl:variable>
<xsl:variable name="pilgrimage-symbol-tag">pilgrimage_symbol</xsl:variable>
<xsl:variable name="ski-symbol-tag">nordic_ski_symbol</xsl:variable>
<xsl:variable name="symbol-level-tag">trail_symbol_level</xsl:variable>

<xsl:variable name="sw-hiking-z14">14</xsl:variable>
<xsl:variable name="sw-hiking-z16">15</xsl:variable>
<xsl:variable name="sw-hiking-w-z14">16</xsl:variable>
<xsl:variable name="sw-hiking-w-z16">17</xsl:variable>
<xsl:variable name="sw-hiking-uw-z14">17</xsl:variable>
<xsl:variable name="sw-hiking-uw-z16">18</xsl:variable>


<xsl:variable name="sw-hiking2-z14">16</xsl:variable>
<xsl:variable name="sw-hiking2-z16">17</xsl:variable>

<xsl:variable name="sw-hiking-b-z14">13</xsl:variable>
<xsl:variable name="sw-hiking-b-z16">14</xsl:variable>
<xsl:variable name="sw-hiking-s-z14">16</xsl:variable>
<xsl:variable name="sw-hiking-s-z16">17</xsl:variable>

<!-- KČT hiking trail colors — Klub českých turistů standard marker colors -->
<xsl:variable name="lc-trail-blue">#0050C8</xsl:variable>
<xsl:variable name="lc-trail-red">#DC0000</xsl:variable>
<xsl:variable name="lc-trail-green">#007820</xsl:variable>
<xsl:variable name="lc-trail-yellow">#E8B400</xsl:variable>
<xsl:variable name="lc-trail-purple">#8020A0</xsl:variable>
<xsl:variable name="lc-trail-orange">#E06000</xsl:variable>
<xsl:variable name="lc-trail-black">#303030</xsl:variable>
<xsl:variable name="lc-trail-white">#FFFFFF</xsl:variable>
<xsl:variable name="lc-trail-dash">#C0D0D0</xsl:variable>

<xsl:variable name="route_condition">route_condition</xsl:variable>
<xsl:variable name="ns-symbol-hu">hu:</xsl:variable>

</xsl:stylesheet>