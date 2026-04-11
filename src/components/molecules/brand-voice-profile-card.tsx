"use client";

// BrandVoiceProfileCard — displays an analysed brand voice profile.

import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/atoms/badge";

export interface BrandVoiceProfile {
  tone: string;
  style: {
    formality: string;
    sentence_length: string;
    active_voice_preference: boolean;
    use_of_first_person_plural: boolean;
  };
  terminology: {
    preferred_terms: string[];
    avoided_terms: string[];
    industry_jargon_level: string;
  };
  writing_patterns: string[];
}

interface BrandVoiceProfileCardProps {
  readonly profile: BrandVoiceProfile;
}

export function BrandVoiceProfileCard({ profile }: BrandVoiceProfileCardProps) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <h3 className="text-sm font-semibold text-foreground">
          Brand Voice Profile
        </h3>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Tone
          </p>
          <p className="mt-1 text-sm text-foreground">{profile.tone}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Style
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="capitalize">
              {profile.style.formality}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {profile.style.sentence_length} sentences
            </Badge>
            {profile.style.active_voice_preference && (
              <Badge variant="secondary">Active voice</Badge>
            )}
            {profile.style.use_of_first_person_plural && (
              <Badge variant="secondary">We / Our</Badge>
            )}
          </div>
        </div>

        {profile.terminology.preferred_terms.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Preferred terms
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {profile.terminology.preferred_terms.slice(0, 12).map((term) => (
                <Badge key={term} variant="outline" className="text-xs">
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {profile.writing_patterns.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Writing patterns
            </p>
            <ul className="mt-1 space-y-1">
              {profile.writing_patterns.map((pattern, i) => (
                <li
                  key={i}
                  className="flex items-start gap-1.5 text-xs text-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--accent))]" />
                  {pattern}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
